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
    Status:      "status",
    CurrentSong: "currentsong"
});


export class MpdClient extends EventEmitter
{
    get isConnected() { return this.socket !== undefined && this.socket !== null && this.socket.closed === false };

    commandQueue = new CommandQueue();
    get isIdle() { return this.commandQueue.first.cmd === "idle" };

    currentStatus = new Status();
    get isPlaying() { return this.currentStatus.state === PlayerState.play };

    currentSong = new Tags();

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
                    let command = this.commandQueue.dequeueFirst();
                    if (command !== undefined)
                    {
                        command.respond(msg);
                    }
                    this.SendNextCommand();
                }
                else if (msg.startsWith("binary: "))
                {
                    const len = Number(msg.substring(8));
                    console.log ("Binary: ", len);
                }
                else if (msg.startsWith("ACK "))
                {
                    let command = this.commandQueue.dequeueFirst();

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

                    this.SendNextCommand();
                }
                else
                {
                    console.log ("MpdClient: Unparsed message. ", msg);
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


    SendNextCommand()
    {
        if (this.isConnected === false)
        {
            return;
        }

        //console.log("SendNextCommand");
        if (this.commandQueue.isEmpty)
        {
            this.idle();
        }
        else
        {
            let command = this.commandQueue.first;
            this.socket.write(`${command.cmd}\n`);
        }
    }


    idle()
    {
        if (this.commandQueue.isEmpty === false || this.isConnected === false)
        {
            return;
        }

        //console.log("MpdClient.idle");
        let command = this.commandQueue.enqueue("idle", data =>
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
                            this.requestStatus();
                            this.requestCurrentSong();
                            break;
                    }
                }
            });
        });
        this.socket.write(`${command.cmd}\n`);
    }

    noidle()
    {
        if (this.isIdle === false || this.isConnected === false)
        {
            return;
        }
        //console.log("MpdClient.noidle");
        this.socket.write("noidle\n");
    }

    requestStatus()
    {
        console.log("MpdClient.requestStatus");
        let command = this.commandQueue.enqueue("status", data =>
        {
            console.log("MpdClient.requestStatus OK");
            this.currentStatus = Status.parse(data);
            this.emit(MpdEvent.Status, this.currentStatus);
        });

        if (this.isIdle) this.noidle();
    }

    requestCurrentSong()
    {
        console.log("MpdClient.requestCurrentSong");
        let command = this.commandQueue.enqueue("currentsong", data =>
        {
            console.log("MpdClient.requestCurrentSong OK");
            this.currentSong = Tags.parse(data);
            this.emit(MpdEvent.CurrentSong, this.currentSong);
        });

        if (this.isIdle) this.noidle();
    }

    play(index)
    {
        console.log("MpdClient.play");
        let command = this.commandQueue.enqueue(`play ${index}`, data =>
        {
            console.log ("MpdClient.play ", data);
        });

        if (this.isIdle) this.noidle();
    }

    pause(isOn)
    {
        console.log("MpdClient.pause");
        let cmd = this.isPlaying ? `pause ${isOn ? 1 : 0}` : "play";
        let command = this.commandQueue.enqueue(cmd, data =>
        {
            console.log (`MpdClient.pause ${isOn}`, data);
        });

        if (this.isIdle) this.noidle();
    }

    stop()
    {
        console.log("MpdClient.stop");
        let command = this.commandQueue.enqueue("stop", data =>
        {
            console.log ("MpdClient.stop ", data);
        });

        if (this.isIdle) this.noidle();
    }

    prev()
    {
        console.log("MpdClient.prev");
        let command = this.commandQueue.enqueue("previous", data =>
        {
            console.log ("MpdClient.prev ", data);
        });

        if (this.isIdle) this.noidle();
    }

    next()
    {
        console.log("MpdClient.next");
        let command = this.commandQueue.enqueue("next", data =>
        {
            console.log ("MpdClient.next", data);
        });

        if (this.isIdle) this.noidle();
    }
}
