import { Socket } from "node:net";
import { EventEmitter } from "node:events";
import { Input } from "./Input.js";

export class DenonOptions
{
    host;
    port = 23;

    constructor(init)
    {
        Object.assign(this, init);
    }
}

export const DenonEvent = Object.freeze (
{
    PowerState:    "powerstate",  
    SelectedInput: "selectedinput"
});

export class DenonDevice extends EventEmitter
{
    constructor(options)
    {
        super();
        this.options = new DenonOptions(options);
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

                    case "SIPHONO\r":     this.emit(DenonEvent.SelectedInput, Input.Phono       ); break;
                    case "SICD\r":        this.emit(DenonEvent.SelectedInput, Input.Cd          ); break;
                    case "SIDVD\r":       this.emit(DenonEvent.SelectedInput, Input.Dvd         ); break;
                    case "SIBD\r":        this.emit(DenonEvent.SelectedInput, Input.Bluray      ); break;
                    case "SITV\r":        this.emit(DenonEvent.SelectedInput, Input.Tv          ); break;
                    case "SISAT/CBL\r":   this.emit(DenonEvent.SelectedInput, Input.SatCbl      ); break;
                    case "SIMPLAY\r":     this.emit(DenonEvent.SelectedInput, Input.MediaPlayer ); break;
                    case "SIGAME\r":      this.emit(DenonEvent.SelectedInput, Input.Game        ); break;
                    case "SITUNER\r":     this.emit(DenonEvent.SelectedInput, Input.Tuner       ); break;
                    case "SIHDRADIO\r":   this.emit(DenonEvent.SelectedInput, Input.HdRadio     ); break;
                    case "SIIRADIO\r":    this.emit(DenonEvent.SelectedInput, Input.IRadio      ); break;
                    case "SISERVER\r":    this.emit(DenonEvent.SelectedInput, Input.Server      ); break;
                    case "SIFAVORITES\r": this.emit(DenonEvent.SelectedInput, Input.Favorites   ); break;
                    case "SIAUX1\r":      this.emit(DenonEvent.SelectedInput, Input.Aux1        ); break;
                    case "SIAUX2\r":      this.emit(DenonEvent.SelectedInput, Input.Aux2        ); break;
                    case "SIAUX3\r":      this.emit(DenonEvent.SelectedInput, Input.Aux3        ); break;
                    case "SIAUX4\r":      this.emit(DenonEvent.SelectedInput, Input.Aux4        ); break;
                    case "SIAUX5\r":      this.emit(DenonEvent.SelectedInput, Input.Aux5        ); break;
                    case "SIAUX6\r":      this.emit(DenonEvent.SelectedInput, Input.Aux6        ); break;
                    case "SIAUX7\r":      this.emit(DenonEvent.SelectedInput, Input.Aux7        ); break;
                    case "SINET\r":       this.emit(DenonEvent.SelectedInput, Input.Net         ); break;
                    case "SIBT\r":        this.emit(DenonEvent.SelectedInput, Input.Bluetooth   ); break;
                
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
