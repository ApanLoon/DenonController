import type { Ref } from "vue";
import type { MiniacOptions } from "./MiniacOptions";

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
    player_IsPlaying     : Ref<boolean>;
    player_CurrentSong   : Ref<string>; 
    player_CurrentAlbum  : Ref<string>; 
    player_CurrentArtist : Ref<string>; 

    player_RequestPlay() : void;
    player_RequestPause() : void;
    player_RequestStop() : void;
    player_RequestPlayToggle() : void;
    player_RequestPrev() : void;
    player_RequestNext() : void;
}