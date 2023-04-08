
import { WebSocketServer } from "ws";
import { EventEmitter } from 'node:events';

export class MiniacEvent
{
    static get RequestAmpPowerState() { return "amp:powerstate";    }
    static get SetAmpPowerState()     { return "amp:setpowerstate"; }
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
                    case "Amp:RequestPowerState": this.emit(MiniacEvent.RequestAmpPowerState);       break;
                    case "Amp:SetPowerState":     this.emit(MiniacEvent.SetAmpPowerState, msg.isOn); break;
                }
            });
        });
    }

    sendAmpPowerState (isOn)
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
}