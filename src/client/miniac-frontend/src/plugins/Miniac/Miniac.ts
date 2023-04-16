import type { IMiniac } from "./IMiniac";
import type { MiniacOptions } from "./MiniacOptions";
import { ref, reactive, type Ref } from "vue";
import { PlayerStatus } from "./PlayerStatus";
import { Song } from "./Song";

export class Miniac implements IMiniac
{
    /// General:
    public options : MiniacOptions;
    public isConnected : Ref<boolean> = ref(false); 

    private _socket? : WebSocket;

    public constructor(options : MiniacOptions)
    {
        this.options = options;
    }

    public connect(connectHandler? : () => void) : void
    {
        console.log(`Miniac: Connecting to ${this.options.host}:${this.options.port}...`);

        this._socket = new WebSocket(`ws://${this.options.host}:${this.options.port}`);

        this._socket.addEventListener("open", () => 
        {
            console.log("Miniac: Connected");
            this.isConnected.value = true;
            if (connectHandler)
            {
                connectHandler();
            }
        });
        
        this._socket.addEventListener("message", ({ data }) => 
        {
            const msg = JSON.parse(data);
        
            switch (msg.type)
            {
                case "Amp:PowerState":     this.amp_IsOn.value          = msg.isOn;  console.log(`Miniac: Amplifier power is ${msg.isOn as boolean === true ? "on" : "in standby"}.`); break;
                case "Amp:SelectedInput":  this.amp_SelectedInput.value = msg.input; console.log(`Miniac: Amplifier input is ${msg.input}.`); break;

                case "Player:Status":      console.log("Miniac: Player status",       msg.status); this.player_Status.copyFrom(msg.status);     break;
                case "Player:CurrentSong": console.log("Miniac: Player current song", msg.song);   this.player_CurrentSong.copyFrom(msg.song);  break;
                case "Player:Playlist":    console.log("Miniac: Player playlist",     msg.list);   this.player_Playlist.splice(0, Infinity, ...msg.list);  break;
                case "Player:Artists":     console.log("Miniac: Player artists",      msg.list);   this.player_Artists.splice (0, Infinity, ...msg.list);  break;
                case "Player:Albums":      console.log("Miniac: Player albums",       msg.list);   this.player_Albums.splice  (0, Infinity, ...msg.list);  break;
            }
        });

        this._socket.onclose = error =>
        {
            console.log("Miniac: Connection closed.", error);
            this.isConnected.value = false;
            setTimeout(()=>this.connect(connectHandler), 1000);
        }
    }


    /// Amplifier:
    public amp_IsOn          : Ref<boolean> = ref(false);
    public amp_SelectedInput : Ref<string>  = ref("");

    public amp_RequestPowerState() : void
    {
        console.log("Miniac.amp_RequestPowerState");
        this._socket?.send(JSON.stringify({ type: "Amp:RequestPowerState" }));
    }

    public amp_RequestPowerOn() : void
    {
        console.log("Miniac.amp_RequestPowerOn");
        this._socket?.send(JSON.stringify({ type: "Amp:SetPowerState", isOn: true }));
    }

    public amp_RequestPowerOff() : void
    {
        console.log("Miniac.amp_RequestPowerOff");
        this._socket?.send(JSON.stringify({ type: "Amp:SetPowerState", isOn: false }));
    }

    public amp_RequestPowerToggle() : void
    {
        this.amp_IsOn.value ? this.amp_RequestPowerOff() : this.amp_RequestPowerOn();
    }

    public amp_RequestSelectedInput() : void
    {
        console.log("Miniac.amp_RequestSelectedInput");
        this._socket?.send(JSON.stringify({ type: "Amp:RequestSelectedInput" }));
    }

    public amp_SetSelectedInput(input : string) : void
    {
        console.log("Miniac.amp_SetelectedInput ", input);
        this._socket?.send(JSON.stringify({ type: "Amp:SetSelectedInput", input: input }));
    }


    /// Player:
    public player_Status        = reactive(new PlayerStatus());
    public player_CurrentSong   = reactive(new Song());
    public player_Playlist      = reactive(new Array<Song>());
    public player_Artists       = reactive(new Array<string>());
    public player_Albums        = reactive(new Array<{key : string, value : string }>());

    public player_RequestStatus()      : void
    {
        console.log("Miniac.player_RequestStatus");
        this._socket?.send(JSON.stringify({ type: "Player:RequestStatus" }));
    }

    public player_RequestCurrentSong() : void
    {
        console.log("Miniac.player_RequestCurrentSong");
        this._socket?.send(JSON.stringify({ type: "Player:RequestCurrentSong" }));
    }

    public player_RequestPlay() : void
    {
        console.log("Miniac.player_RequestPlay");
        this._socket?.send(JSON.stringify({ type: "Player:Play" }));
    }

    public player_RequestPause() : void
    {
        console.log("Miniac.player_RequestPause");
        this._socket?.send(JSON.stringify({ type: "Player:Pause" }));
    }

    public player_RequestStop() : void
    {
        console.log("Miniac.player_RequestStop");
        this._socket?.send(JSON.stringify({ type: "Player:Stop" }));
    }

    public player_RequestPlayToggle() : void
    {
        console.log("Miniac.player_RequestPlayToggle");
        this.player_Status.isPlaying ? this.player_RequestPause() : this.player_RequestPlay();
    }

    public player_RequestPrev() : void
    {
        console.log("Miniac.player_RequestPrev");
        this._socket?.send(JSON.stringify({ type: "Player:Prev" }));
    }

    public player_RequestNext() : void
    {
        console.log("Miniac.player_RequestNext");
        this._socket?.send(JSON.stringify({ type: "Player:Next" }));
    }

    public player_RequestPlaylist() : void
    {
        console.log("Miniac.player_RequestPlaylist");
        this._socket?.send(JSON.stringify({ type: "Player:RequestPlaylist" }));
    }

    public player_RequestArtists() : void
    {
        console.log("Miniac.player_RequestArtists");
        this._socket?.send(JSON.stringify({ type: "Player:RequestArtists" }));
    }
    
    public player_RequestAlbums(artists : Array<string>) : void
    {
        console.log("Miniac.player_RequestAlbums");
        this._socket?.send(JSON.stringify({ type: "Player:RequestAlbums", artists: artists }));
    }
}