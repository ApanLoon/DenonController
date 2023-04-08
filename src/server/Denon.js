import { Socket } from 'node:net';
import { EventEmitter } from 'node:events';

export class DenonOptions
{
    host;
    port = 23;
}

export class DenonEvent
{
    static get PowerState()    { return "powerstate";    }
    static get SelectedInput() { return "selectedinput"; }
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

                    case "SITUNER\r":     this.emit(DenonEvent.SelectedInput, "TUNER"     ); break;
                    case "SIDVD\r":       this.emit(DenonEvent.SelectedInput, "DVD"       ); break;
                    case "SIBD\r":        this.emit(DenonEvent.SelectedInput, "BD"        ); break;
                    case "SITV\r":        this.emit(DenonEvent.SelectedInput, "TV"        ); break;
                    case "SISAT/CBL\r":   this.emit(DenonEvent.SelectedInput, "SAT/CBL"   ); break;
                    case "SIMPLAY\r":     this.emit(DenonEvent.SelectedInput, "MPLAY"     ); break;
                    case "SIGAME\r":      this.emit(DenonEvent.SelectedInput, "GAME"      ); break;
                    case "SIAUX1\r":      this.emit(DenonEvent.SelectedInput, "AUX1"      ); break;
                    case "SINET\r":       this.emit(DenonEvent.SelectedInput, "NET"       ); break;
                    case "SIPANDORA\r":   this.emit(DenonEvent.SelectedInput, "PANDORA"   ); break;
                    case "SISIRIUSXM\r":  this.emit(DenonEvent.SelectedInput, "SIRIUSXM"  ); break;
                    case "SILASTFM\r":    this.emit(DenonEvent.SelectedInput, "LASTFM"    ); break;
                    case "SIFLICKR\r":    this.emit(DenonEvent.SelectedInput, "FLICKR"    ); break;
                    case "SIFAVORITES\r": this.emit(DenonEvent.SelectedInput, "FAVORITES" ); break;
                    case "SIIRADIO\r":    this.emit(DenonEvent.SelectedInput, "IRADIO"    ); break;
                    case "SISERVER\r":    this.emit(DenonEvent.SelectedInput, "SERVER"    ); break;
                    case "SIUSB/IPOD\r":  this.emit(DenonEvent.SelectedInput, "USB/IPOD"  ); break;
                    case "SIUSB\r":       this.emit(DenonEvent.SelectedInput, "USB"       ); break;
                    case "SIIPD\r":       this.emit(DenonEvent.SelectedInput, "IPD"       ); break;
                    case "SIIRP\r":       this.emit(DenonEvent.SelectedInput, "IRP"       ); break;
                    case "SIFVP\r":       this.emit(DenonEvent.SelectedInput, "FVP"       ); break;

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

    requestSelectedInput()
    {
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }
        console.log("DenonDevice.requestSelectedInput");
        this.socket.write("SI?\r");
    }

    setSelectedInput(input)
    {
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }
        console.log("DenonDevice.setSelectedInput ", input);
        this.socket.write(`SI${input}\r`);
    }

}
