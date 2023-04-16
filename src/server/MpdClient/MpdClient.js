import { Socket } from "node:net";
import { EventEmitter } from "node:events";
import { PlayerState, Status } from "./Status.js";
import { Tags } from "./Tags.js";
import { CommandQueue } from "./CommandQueue.js";

export class MpdOptions
{
    host;
    port = 6600;

    constructor(init)
    {
        Object.assign(this, init);
    }
}

export const MpdEvent = Object.freeze(
{
    Status:       "status",
    CurrentSong:  "currentsong",
    PlaylistInfo: "playlistinfo",
    Artists:      "artists",
    Albums:       "albums"
});


export class MpdClient extends EventEmitter
{
    get isConnected() { return this.socket !== undefined && this.socket !== null && this.socket.closed === false };

    _commandQueue = new CommandQueue();
    get _isIdle() { return this._commandQueue.first.cmd === "idle" };

    _currentStatus = new Status();
    get _isPlaying() { return this._currentStatus.state === PlayerState.play };

    _currentSong = new Tags();

    _data = "";

    constructor(options)
    {
        super();
        this.options = new MpdOptions(options);
        this.socket = new Socket();
    }

    connect()
    {
        console.log(`MpdClient.connect: Connecting to ${this.options.host}:${this.options.port}...`);
        return new Promise ((resolve, reject) =>
        {
            this.socket.once('connect', () =>
            {
                console.log (`MpdClient: Socket connected to ${this.options.host}:${this.options.port}`);
                this.data = "";
                resolve();
            });

            this.socket.once('error', error =>
            {
                console.log ("MpdClient: Error ", error);
                reject(error);
            });

            this.socket.on('data', data =>
            {
                let msg = data.toString().trim();
                if (msg.length == 0)
                {
                    return;
                }
                if (msg.startsWith("OK MPD "))
                {
                    console.log (`MPD: version=${msg.substring(7).trim()}`);
                    this.idle();
                }
                else if (msg.endsWith("OK"))
                {
                    this._data += msg.replace(/\nOK$/, "\n");

                    let command = this._commandQueue.dequeueFirst();
                    if (command !== undefined)
                    {
                        command.respond(this._data);
                    }
                    this.sendNextCommand();
                }
                else if (msg.startsWith("binary: "))
                {
                    const len = Number(msg.substring(8));
                    console.log ("Binary: ", len);
                }
                else if (msg.startsWith("ACK "))
                {
                    let command = this._commandQueue.dequeueFirst();

                    const re = new RegExp("^ACK \\[(\\d+)@(\\d+)\\]\\s+\\{(.*)}\\s+(.*)$");
                    const r = msg.match(re);
                    if (r)
                    {
                        const errorCode = r[1];
                        const listOffset = r[2];
                        const command = r[3];
                        const message = r[4];
                        console.log (`MpdClient: Error [${errorCode}@${listOffset}] {${command}} ${message}`);    
                    }
                    else 
                    {
                        console.log ("Error: ", msg);
                    }

                    this.sendNextCommand();
                }
                else
                {
                    // Probably truncated by MTU
                    this._data += msg;
                }
            });

            this.socket.on('close', ()=>
            {
                console.log("MpdClient: Connection closed.");
            })

            this.socket.connect(this.options.port, this.options.host);
        });
    }

    close()
    {
        if (this.isConnected)
        {
            console.log ("MpdClient.close: Closing socket...");
            this.socket.close();
        }
    }


    sendNextCommand()
    {
        if (this.isConnected === false)
        {
            return;
        }

        //console.log("SendNextCommand");
        this._data = "";
        if (this._commandQueue.isEmpty)
        {
            this.idle();
        }
        else
        {
            let command = this._commandQueue.first;
            this.socket.write(`${command.cmd}\n`);
        }
    }


    idle()
    {
        if (this._commandQueue.isEmpty === false || this.isConnected === false)
        {
            return;
        }

        //console.log("MpdClient.idle");
        let command = this._commandQueue.enqueue("idle", data =>
        {
            data.split("\n").forEach(line =>
            {
                if (line.startsWith("changed:"))
                {
                    const subsystem = line.substring(8).trim();
                    console.log(`MpdClient.idle: Subsystem "${subsystem}" changed.`);
                    switch (subsystem)
                    {
                        case "player":
                            this.status();
                            this.currentSong();
                            break;

                        case "playlist":
                            this.playlistinfo();
                            break;
                        }
                }
            });
        });
        this.socket.write(`${command.cmd}\n`);
    }

    noidle()
    {
        if (this._isIdle === false || this.isConnected === false)
        {
            return;
        }
        //console.log("MpdClient.noidle");
        this.socket.write("noidle\n");
    }

    status()
    {
        console.log("MpdClient.requestStatus");
        let command = this._commandQueue.enqueue("status", data =>
        {
            console.log("MpdClient.requestStatus OK");
            this._currentStatus = Status.parse(data);
            this.emit(MpdEvent.Status, this._currentStatus);
        });

        if (this._isIdle) this.noidle();
    }

    currentSong()
    {
        console.log("MpdClient.requestCurrentSong");
        let command = this._commandQueue.enqueue("currentsong", data =>
        {
            console.log("MpdClient.requestCurrentSong OK");
            this._currentSong = Tags.parse(data);
            this.emit(MpdEvent.CurrentSong, this._currentSong);
        });

        if (this._isIdle) this.noidle();
    }

    play(index)
    {
        console.log("MpdClient.play");
        let command = this._commandQueue.enqueue(`play ${index}`, data =>
        {
            console.log ("MpdClient.play OK");
        });

        if (this._isIdle) this.noidle();
    }

    pause(isOn)
    {
        console.log("MpdClient.pause");
        let cmd = this._isPlaying ? `pause ${isOn ? 1 : 0}` : "play";
        let command = this._commandQueue.enqueue(cmd, data =>
        {
            console.log (`MpdClient.pause ${isOn} OK`);
        });

        if (this._isIdle) this.noidle();
    }

    stop()
    {
        console.log("MpdClient.stop");
        let command = this._commandQueue.enqueue("stop", data =>
        {
            console.log ("MpdClient.stop OK");
        });

        if (this._isIdle) this.noidle();
    }

    prev()
    {
        console.log("MpdClient.prev");
        let command = this._commandQueue.enqueue("previous", data =>
        {
            console.log ("MpdClient.prev OK");
        });

        if (this._isIdle) this.noidle();
    }

    next()
    {
        console.log("MpdClient.next");
        let command = this._commandQueue.enqueue("next", data =>
        {
            console.log ("MpdClient.next OK");
        });

        if (this._isIdle) this.noidle();
    }

    playlistinfo(start, end)
    {
        console.log("MpdClient.playlistinfo");
        let args = "";
        if (start)
        {
            args += start;
        }
        if (end)
        {
            args += ":" + end;
        }
        let command = this._commandQueue.enqueue(`playlistinfo ${args}`, data =>
        {
            console.log ("MpdClient.playlistinfo OK");
            const l = data.split(/\n*file\:/).map(x=>Tags.parse(x));
            this.emit(MpdEvent.PlaylistInfo, l);
        });

        if (this._isIdle) this.noidle();
    }

    artists()
    {
        console.log("MpdClient.artists");
        this.list ("artist", "", [], data => 
        {
            console.log ("MpdClient.artists OK");
            const l = data.split(/\n*Artist\:/).map(x =>
            {
                if (x.match(/^\s+$/)) return x;
                return x.trim();
            });
            this.emit(MpdEvent.Artists, l);
        });
    }

    _matchProp(prop, data)
    {
        return data.startsWith(prop)
        ? data.substring(prop.length)
        : undefined;
    }

    albums(artists)
    {
        console.log("MpdClient.albums");
        let filter = "";
        if (artists && artists.length > 0)
        {
            // NOTE: There is apparently no OR operator in the mpd expressions.
            //       P OR Q = NOT( NOT(P) AND NOT(Q) )
            filter = `\"(!( ${artists.map(x=>`(albumartist != '${x}')`).join(" AND ")} ))\"`;
        }

        this.list ("album", filter, ["albumartist"], data => 
        {
            console.log ("MpdClient.albums OK");
            let l = [];
            data.split("\n").forEach(x =>
            {
                let value = this._matchProp("AlbumArtist:", x);
                if (value)
                {
                    l.push({ key: "artist", value: value });
                    return;
                }
                value = this._matchProp("Album:", x);
                if (value)
                {
                    l.push({ key: "album", value: value });
                    return;
                }
            });

            // let l = [];
            // let current = undefined;
            // data.split("\n").forEach(x =>
            // {
            //     if (x.startsWith("AlbumArtist:"))
            //     {
            //         if (current)
            //         {
            //             l.push(current);
            //         }

            //         let artist = x.substring(12);
            //         artist = artist.match(/^\s+$/) ? artist : artist.trim();
            //         current = { Artist: artist, Albums: [] };
            //     }
            //     else if (x.startsWith("Album:"))
            //     {
            //         let album = x.substring(6);
            //         album = album.match(/^\s+$/) ? album : album.trim();
            //         if (current)
            //         {
            //             current.Albums.push(album);
            //         }
            //     }
            // });
            // if (current)
            // {
            //     l.push(current);
            // }

            //console.log(l);
            this.emit(MpdEvent.Albums, l);
        });
    }

    list(type, filter, groups, onResponse)
    {
        let args = type;
        if (filter && filter !== "")     args += ` ${filter}`;
        if (groups && groups.length > 0) args += ` group ${groups.join(" group ")}`;
        let command = this._commandQueue.enqueue(`list ${args}`, onResponse);

        if (this._isIdle) this.noidle();
    }
}
