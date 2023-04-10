
import { WebSocketServer } from "ws";
import { EventEmitter } from 'node:events';
import { randomUUID } from "crypto";

export class MiniacOptions
{
    port = 4000;

    constructor(init)
    {
        Object.assign(this, init);
    }
}

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

class Connection
{
    id = randomUUID();
    socket;

    constructor(socket, messageParser, closeHandler)
    {
        this.socket = socket;
        socket.on("message", messageParser);
        socket.on("close", event => closeHandler(event, this));
    }
}

class ConnectionCollection
{
    connections = [];

    add (connection)
    {
        let c = this.connections.find(x=>x.id === connection.id);
        if (c)
        {
            return;
        }
        this.connections.push (connection);
    }

    remove(connection)
    {
        this.connections.filter((value, index, arr) =>
        {
            if (value.id === connection.id)
            {
                arr.splice(index, 1);
            }
        });
    }

    sendToAll(msg)
    {
        this.connections.forEach(connection =>
        {
            if (connection.socket === undefined || connection.socket === null || connection.socket.closed === true)
            {
                return;
            }
            connection.socket.send(msg);
        });
    }
}

export class MiniacApi extends EventEmitter
{
    constructor(options)
    {
        super();

        this.options = new MiniacOptions(options);
        this.connections = new ConnectionCollection();

        this.server = new WebSocketServer({ port: this.options.port });

        this.server.on("connection", socket =>
        {
            let connection = new Connection(socket, data =>
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
            },
            (event, connection) =>
            {
                console.log ("MiniacApi: Client disconnected.", connection.id);
                this.connections.remove(connection);
            });

            console.log("MiniacApi: Client connected", connection.id);

            this.connections.add(connection);
        });
    }

    /// Amplifier:
    ///

    amp_SendPowerState (isOn)
    {
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Amp:PowerState",
            isOn: isOn
        }));
    }

    amp_SendSelectedInput (input)
    {
        this.connections.sendToAll(JSON.stringify(
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
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Player:Status",
            status: status
        }));
    }

    player_SendCurrentSong (song)
    {
        //console.log("MiniacApi.player_SendCurrentSong: ", song);
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Player:CurrentSong",
            song: song
        }));
    }
}