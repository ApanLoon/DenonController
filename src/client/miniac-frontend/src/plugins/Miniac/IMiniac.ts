import type { Ref } from "vue";
import type { MiniacOptions } from "./MiniacOptions";
import type { PlayerStatus } from "./PlayerStatus";
import type { Song } from "./Song";

export interface IMiniac
{
    // General:
    options? : MiniacOptions;
    isConnected : Ref<boolean>; 
    connect(connectHandler? : () => void) : void;

    // Amplifier:
    amp_IsOn          : Ref<boolean>;
    amp_SelectedInput : Ref<string>;

    amp_RequestPowerState() : void;
    amp_RequestPowerOn() : void;
    amp_RequestPowerOff() : void;
    amp_RequestPowerToggle() : void;

    amp_RequestSelectedInput() : void;
    amp_SetSelectedInput(input : string) : void;

    // Player:
    player_Status        : PlayerStatus;
    player_CurrentSong   : Song;
    player_Playlist      : Array<Song>;
    player_Artists       : Array<string>;
    player_Albums        : Array<{key : string, value : string }>;


    player_RequestStatus()                        : void;
    player_RequestCurrentSong()                   : void;
    player_RequestPlay()                          : void;
    player_RequestPause()                         : void;
    player_RequestStop()                          : void;
    player_RequestPlayToggle()                    : void;
    player_RequestPrev()                          : void;
    player_RequestNext()                          : void;
    player_RequestPlaylist()                      : void;
    player_RequestArtists()                       : void;
    player_RequestAlbums(artists : Array<string>) : void;
}