import { Socket } from 'node:net';
import { EventEmitter } from 'node:events';

export class DenonOptions
{
    host;
    port = 23;
}

export class DenonEvent
{
    static get PowerState() { return "powerstate"; }
}

export class DenonDevice extends EventEmitter
{

    constructor(options)
    {
        super();
        this.options = options;
        this.socket = new Socket();
    }

    connect()
    {
        console.log(`DenonDevice.connect: Connecting to ${this.options.host}:${this.options.port}...`);
        return new Promise ((resolve, reject) =>
        {
            this.socket.once('connect', () =>
            {
                console.log (`DenonDevice: Socket connected to ${this.options.host}:${this.options.port}`);
                resolve();
            });

            this.socket.once('error', error =>
            {
                console.log ("DenonDevice: Error ", error);
                reject(error);
            });

            this.socket.on('data', data =>
            {
                let msg = data.toString();
                switch (msg)
                {
                    case "PWON\r":      this.emit(DenonEvent.PowerState, true ); break;
                    case "PWSTANDBY\r": this.emit(DenonEvent.PowerState, false); break;
                    default: console.log ("DenonDevice: Received: ", msg); break;
                }
            });

            this.socket.on('close', ()=>
            {
                console.log("DenonDevice: Connection closed.");
            })

            this.socket.connect(this.options.port, this.options.host);
        });
    }

    close()
    {
        if (this.socket !== undefined && this.socket !== null && this.socket.closed === false)
        {
            console.log ("DenonDevice.close: Closing socket...");
            this.socket.close();
        }
    }

    requestPowerState()
    {
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }
        console.log("DenonDevice.requestPowerState");
        this.socket.write("PW?\r");
    }

    setPowerState(isOn)
    {
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }
        console.log("DenonDevice.setPowerState ", isOn);
        this.socket.write(`PW${ isOn ? "ON" : "STANDBY" }\r`);
    }
}
