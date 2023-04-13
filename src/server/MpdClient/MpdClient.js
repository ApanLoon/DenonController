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
    commandQueue = new CommandQueue();
    idleIsForced = false;

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
                    this.requestStatus(() => this.requestCurrentSong());
                }
                else if (msg.endsWith("OK"))
                {
                    let command = this.commandQueue.dequeueFirst();
                    if (command !== undefined)
                    {
                        command.respond(msg);
                    }
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
                    else console.log ("Error: ", msg);
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
        if (this.socket !== undefined && this.socket !== null && this.socket.closed === false)
        {
            console.log ("MpdClient.close: Closing socket...");
            this.socket.close();
        }
    }

    idle()
    {
        if (this.commandQueue.first?.cmd === "idle")
        {
            return;
        }

        console.log("MpdClient.idle");
        let command = this.commandQueue.enqueue("idle", this.socket, data =>
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
                            this.idleIsForced = true;
                            this.requestStatus(()=>this.requestCurrentSong());
                            break;
                    }
                }
            });
            
            if (!this.idleIsForced) // TODO: Is it safe to set a property from noidle?
            {
                this.idle();
            }
            this.idleIsForced = false;
        });
    }

    noidle()
    {
        if (this.socket !== undefined && this.socket !== null && this.socket.closed === false && this.commandQueue.first?.cmd === "idle")
        {
            console.log("MpdClient.noidle");
            this.idleIsForced = true;
            this.socket.write("noidle\n");
        }
    }

    requestStatus(onResponse)
    {
        console.log("MpdClient.requestStatus");
        this.noidle();
        let command = this.commandQueue.enqueue("status", this.socket, data =>
        {
            this.currentStatus = Status.parse(data);
            this.emit(MpdEvent.Status, this.currentStatus);

            onResponse ? onResponse() : this.idle();
        });
    }

    requestCurrentSong(onResponse)
    {
        console.log("MpdClient.requestCurrentSong");
        this.noidle();
        let command = this.commandQueue.enqueue("currentsong", this.socket, data =>
        {
            this.currentSong = Tags.parse(data);
            this.emit(MpdEvent.CurrentSong, this.currentSong);

            onResponse ? onResponse() : this.idle();
        });
    }

    play(index, onResponse)
    {
        console.log("MpdClient.play");
        this.noidle();
        let command = this.commandQueue.enqueue(`play ${index}`, this.socket, data =>
        {
            console.log ("MpdClient.play ", data);
            onResponse ? onResponse() : this.idle();
        });
    }

    pause(isOn, onResponse)
    {
        console.log("MpdClient.pause");
        this.noidle();
        let cmd = this.isPlaying ? `pause ${isOn ? 1 : 0}` : "play";
        let command = this.commandQueue.enqueue(cmd, this.socket, data =>
        {
            console.log (`MpdClient.pause ${isOn}`, data);
            onResponse ? onResponse() : this.idle();
        });
    }

    stop(onResponse)
    {
        console.log("MpdClient.stop");
        this.noidle();
        let command = this.commandQueue.enqueue("stop", this.socket, data =>
        {
            console.log ("MpdClient.stop ", data);
            onResponse ? onResponse() : this.idle();
        });
    }

    prev(onResponse)
    {
        console.log("MpdClient.prev");
        this.noidle();
        let command = this.commandQueue.enqueue("previous", this.socket, data =>
        {
            console.log ("MpdClient.prev ", data);
            onResponse ? onResponse() : this.idle();
        });
    }

    next(onResponse)
    {
        console.log("MpdClient.next");
        this.noidle();
        let command = this.commandQueue.enqueue("next", this.socket, data =>
        {
            console.log ("MpdClient.next", data);
            onResponse ? onResponse() : this.idle();
        });
    }
}
