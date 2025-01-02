
import { WebSocketServer } from "ws";
import { EventEmitter } from "node:events";
import { Connection, ConnectionCollection } from "./ConnectionCollection.js";

export class MiniacOptions
{
    port = 4000;

    constructor(init)
    {
        Object.assign(this, init);
    }
}

export const MiniacEvent = Object.freeze(
{
    Amp_RequestPowerState:     "amp:powerstate",      
    Amp_SetPowerState:         "amp:setpowerstate",   
    Amp_RequestSelectedInput:  "amp:selectedinput",   
    Amp_SetSelectedInput:      "amp:setselectedinput",

    Player_RequestStatus:      "player:status",       
    Player_RequestCurrentSong: "player:currentsong",  
    Player_Play:               "player:play",         
    Player_Pause:              "player:pause",        
    Player_Stop:               "player:stop",         
    Player_Next:               "player:next",         
    Player_Prev:               "player:prev",
    Player_RequestPlaylist:    "player:playlist",
    Player_RequestArtists:     "player:artists",
    Player_RequestAlbums:      "player:albums",

    Bluetooth_RequestStatus:   "bluetooth:status",
    Bluetooth_SetPowered:      "bluetooth:powered",
    Bluetooth_SetDiscoverable: "bluetooth:discoverable"
});

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
                    case "Amp:RequestPowerState":     this.emit(MiniacEvent.Amp_RequestPowerState);             break;
                    case "Amp:SetPowerState":         this.emit(MiniacEvent.Amp_SetPowerState, msg.isOn);       break;
    
                    case "Amp:RequestSelectedInput":  this.emit(MiniacEvent.Amp_RequestSelectedInput);          break;
                    case "Amp:SetSelectedInput":      this.emit(MiniacEvent.Amp_SetSelectedInput, msg.input);   break;
    
                    case "Player:RequestStatus":      this.emit(MiniacEvent.Player_RequestStatus);              break;
                    case "Player:RequestCurrentSong": this.emit(MiniacEvent.Player_RequestCurrentSong);         break;
                    case "Player:Play":               this.emit(MiniacEvent.Player_Play);                       break;
                    case "Player:Pause":              this.emit(MiniacEvent.Player_Pause);                      break;
                    case "Player:Stop":               this.emit(MiniacEvent.Player_Stop);                       break;
                    case "Player:Next":               this.emit(MiniacEvent.Player_Next);                       break;
                    case "Player:Prev":               this.emit(MiniacEvent.Player_Prev);                       break;
                    case "Player:RequestPlaylist":    this.emit(MiniacEvent.Player_RequestPlaylist);            break;
                    case "Player:RequestArtists":     this.emit(MiniacEvent.Player_RequestArtists);             break;
                    case "Player:RequestAlbums":      this.emit(MiniacEvent.Player_RequestAlbums, msg.artists); break;

                    case "Bluetooth:RequestStatus":   this.emit(MiniacEvent.Bluetooth_RequestStatus);                       break;
                    case "Bluetooth:SetPowered":      this.emit(MiniacEvent.Bluetooth_SetPowered,      msg.isPowered);      break;
                    case "Bluetooth:SetDiscoverable": this.emit(MiniacEvent.Bluetooth_SetDiscoverable, msg.isDiscoverable); break;
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

    player_SendPlaylist (list)
    {
        //console.log("MiniacApi.player_SendPlaylist: ", list);
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Player:Playlist",
            list: list
        }));
    }
    
    player_SendArtists (list)
    {
        //console.log("MiniacApi.player_SendArtists: ", list);
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Player:Artists",
            list: list
        }));
    }
    
    player_SendAlbums (list)
    {
        //console.log("MiniacApi.player_SendAlbums: ", list);
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Player:Albums",
            list: list
        }));
    }
    
    /// Bluetooth:
    ///

    bluetooth_SendStatus (status)
    {
        //console.log("MiniacApi.bluetooth_SendStatus: ", status);
        this.connections.sendToAll(JSON.stringify(
        {
            type: "Bluetooth:Status",
            status: status
        }));
    }

}
