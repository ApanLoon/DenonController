
import { WebSocketServer } from "ws";
import { EventEmitter } from 'node:events';

export class MiniacEvent
{
    static get Amp_RequestPowerState()     { return "amp:powerstate";       }
    static get Amp_SetPowerState()         { return "amp:setpowerstate";    }

    static get Amp_RequestSelectedInput()  { return "amp:selectedinput";    }
    static get Amp_SetSelectedInput()      { return "amp:setselectedinput"; }

    static get Player_RequestStatus()      { return "player:status";        }
    static get Player_RequestCurrentSong() { return "player:currentsong";   }
    static get Player_Play()               { return "player:play";          }
    static get Player_Pause()              { return "player:pause";         }
    static get Player_Stop()               { return "player:stop";          }
    static get Player_Next()               { return "player:next";          }
    static get Player_Prev()               { return "player:prev";          }
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
                    case "Amp:RequestPowerState":     this.emit(MiniacEvent.Amp_RequestPowerState);           break;
                    case "Amp:SetPowerState":         this.emit(MiniacEvent.Amp_SetPowerState, msg.isOn);     break;

                    case "Amp:RequestSelectedInput":  this.emit(MiniacEvent.Amp_RequestSelectedInput);        break;
                    case "Amp:SetSelectedInput":      this.emit(MiniacEvent.Amp_SetSelectedInput, msg.input); break;

                    case "Player:RequestStatus":      this.emit(MiniacEvent.Player_RequestStatus);            break;
                    case "Player:RequestCurrentSong": this.emit(MiniacEvent.Player_RequestCurrentSong);       break;
                    case "Player:Play":               this.emit(MiniacEvent.Player_Play);                     break;
                    case "Player:Pause":              this.emit(MiniacEvent.Player_Pause);                    break;
                    case "Player:Stop":               this.emit(MiniacEvent.Player_Stop);                     break;
                    case "Player:Next":               this.emit(MiniacEvent.Player_Next);                     break;
                    case "Player:Prev":               this.emit(MiniacEvent.Player_Prev);                     break;
                }
            });
        });
    }

    /// Amplifier:
    ///

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


    /// Player:
    ///

    player_SendStatus (status)
    {
        //console.log("MiniacApi.player_SendStatus: ", status);
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }

        this.socket.send(JSON.stringify(
        {
            type: "Player:Status",
            status: status
        }));
    }

    player_SendCurrentSong (song)
    {
        //console.log("MiniacApi.player_SendCurrentSong: ", song);
        if (this.socket === undefined || this.socket === null || this.socket.closed === true)
        {
            return;
        }

        this.socket.send(JSON.stringify(
        {
            type: "Player:CurrentSong",
            song: song
        }));
    }

}