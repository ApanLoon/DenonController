
import { WebSocketServer } from "ws";
import { EventEmitter } from 'node:events';

export class MiniacEvent
{
    static get Amp_RequestPowerState()    { return "amp:powerstate";       }
    static get Amp_SetPowerState()        { return "amp:setpowerstate";    }

    static get Amp_RequestSelectedInput() { return "amp:selectedinput";    }
    static get Amp_SetSelectedInput()     { return "amp:setselectedinput"; }
}

export class MiniacApi extends EventEmitter
{
    socket;

    constructor()
    {
        super();

        this.socket = null;
        this.server = new WebSocketServer({ port: 4000 });
        const self = this;

        this.server.on("connection", socket =>
        {
            console.log("MiniacApi: Client connected");
            self.socket = socket;

            // receive a message from the client
            socket.on("message", data =>
            {
                const msg = JSON.parse(data);
                switch (msg.type)
                {
                    case "Amp:RequestPowerState":    this.emit(MiniacEvent.Amp_RequestPowerState);           break;
                    case "Amp:SetPowerState":        this.emit(MiniacEvent.Amp_SetPowerState, msg.isOn);     break;

                    case "Amp:RequestSelectedInput": this.emit(MiniacEvent.Amp_RequestSelectedInput);        break;
                    case "Amp:SetSelectedInput":     this.emit(MiniacEvent.Amp_SetSelectedInput, msg.input); break;
                }
            });
        });
    }

    amp_SendPowerState (isOn)
    {
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }

        this.socket.send(JSON.stringify(
        {
            type: "Amp:PowerState",
            isOn: isOn
        }));
    }

    amp_SendSelectedInput (input)
    {
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }

        this.socket.send(JSON.stringify(
        {
            type: "Amp:SelectedInput",
            input: input
        }));
    }

}