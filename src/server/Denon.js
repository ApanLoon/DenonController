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

/// AVR X3500H, X2500H, X1500H, S940H, S740H, S640H
export class DenonInput
{
    static get Phono()       { return "PHONO";     }
    static get Cd()          { return "CD";        }
    static get Dvd()         { return "DVD";       }
    static get Bluray()      { return "BD";        }
    static get Tv()          { return "TV";        }
    static get SatCbl()      { return "SAT/CBL";   }
    static get MediaPlayer() { return "MPLAY";     }
    static get Game()        { return "GAME";      }
    static get Tuner()       { return "TUNER";     }
    static get HdRadio()     { return "HDRADIO";   } // North America model only
    static get IRadio()      { return "IRADIO";    }
    static get Server()      { return "SERVER";    }
    static get Favorites()   { return "FAVORITES"; }
    static get Aux1()        { return "AUX1";      }
    static get Aux2()        { return "AUX2";      }
    static get Aux3()        { return "AUX3";      }
    static get Aux4()        { return "AUX4";      }
    static get Aux5()        { return "AUX5";      }
    static get Aux6()        { return "AUX6";      }
    static get Aux7()        { return "AUX7";      }
    static get Net()         { return "NET";       }
    static get Bluetooth()   { return "BT";        }
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

                    case "SIPHONO\r":     this.emit(DenonEvent.SelectedInput, DenonInput.Phono       ); break;
                    case "SICD\r":        this.emit(DenonEvent.SelectedInput, DenonInput.Cd          ); break;
                    case "SIDVD\r":       this.emit(DenonEvent.SelectedInput, DenonInput.Dvd         ); break;
                    case "SIBD\r":        this.emit(DenonEvent.SelectedInput, DenonInput.Bluray      ); break;
                    case "SITV\r":        this.emit(DenonEvent.SelectedInput, DenonInput.Tv          ); break;
                    case "SISAT/CBL\r":   this.emit(DenonEvent.SelectedInput, DenonInput.SatCbl      ); break;
                    case "SIMPLAY\r":     this.emit(DenonEvent.SelectedInput, DenonInput.MediaPlayer ); break;
                    case "SIGAME\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Game        ); break;
                    case "SITUNER\r":     this.emit(DenonEvent.SelectedInput, DenonInput.Tuner       ); break;
                    case "SIHDRADIO\r":   this.emit(DenonEvent.SelectedInput, DenonInput.HdRadio     ); break;
                    case "SIIRADIO\r":    this.emit(DenonEvent.SelectedInput, DenonInput.IRadio      ); break;
                    case "SISERVER\r":    this.emit(DenonEvent.SelectedInput, DenonInput.Server      ); break;
                    case "SIFAVORITES\r": this.emit(DenonEvent.SelectedInput, DenonInput.Favorites   ); break;
                    case "SIAUX1\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Aux1        ); break;
                    case "SIAUX2\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Aux2        ); break;
                    case "SIAUX3\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Aux3        ); break;
                    case "SIAUX4\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Aux4        ); break;
                    case "SIAUX5\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Aux5        ); break;
                    case "SIAUX6\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Aux6        ); break;
                    case "SIAUX7\r":      this.emit(DenonEvent.SelectedInput, DenonInput.Aux7        ); break;
                    case "SINET\r":       this.emit(DenonEvent.SelectedInput, DenonInput.Net         ); break;
                    case "SIBT\r":        this.emit(DenonEvent.SelectedInput, DenonInput.Bluetooth   ); break;
                
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
