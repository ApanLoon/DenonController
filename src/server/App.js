
import { DenonDevice, DenonEvent, DenonInput } from "./Denon.js";
import { MpdClient, MpdEvent, PlayerState } from "./MpdClient.js";
import { MiniacApi, MiniacEvent } from "./MiniacApi.js";
import { readFileSync } from "fs";

console.log ("App: Starting up...");

const config = JSON.parse(readFileSync("config.json"));

const miniacApi = new MiniacApi   ({                           port: config.miniac_Port });
const amp       = new DenonDevice ({ host: config.amp_Host,    port: config.amp_Port    });
const player    = new MpdClient   ({ host: config.player_Host, port: config.player_Port });

amp.on(DenonEvent.PowerState,    isOn  => miniacApi.amp_SendPowerState(isOn));
amp.on(DenonEvent.SelectedInput, input => miniacApi.amp_SendSelectedInput(amp_InputNameFromDenon (input)));

player.on(MpdEvent.Status,      status => miniacApi.player_SendStatus      (playerStatusFromMpd(status)));
player.on(MpdEvent.CurrentSong, song   => miniacApi.player_SendCurrentSong (playerSongFromMpd(song)));

miniacApi.on(MiniacEvent.Amp_RequestPowerState,     ()      => amp.requestPowerState());
miniacApi.on(MiniacEvent.Amp_SetPowerState,         (isOn)  => amp.setPowerState(isOn));
miniacApi.on(MiniacEvent.Amp_RequestSelectedInput,  ()      => amp.requestSelectedInput());
miniacApi.on(MiniacEvent.Amp_SetSelectedInput,      (input) => amp.setSelectedInput(amp_InputNameFromMiniac (input)));

miniacApi.on(MiniacEvent.Player_RequestStatus,      ()      => player.requestStatus());
miniacApi.on(MiniacEvent.Player_RequestCurrentSong, ()      => player.requestCurrentSong());
miniacApi.on(MiniacEvent.Player_Play,               ()      => player.pause(false));
miniacApi.on(MiniacEvent.Player_Pause,              ()      => player.pause(true));
miniacApi.on(MiniacEvent.Player_Stop,               ()      => player.stop());
miniacApi.on(MiniacEvent.Player_Next,               ()      => player.next());
miniacApi.on(MiniacEvent.Player_Prev,               ()      => player.prev());

amp.connect()
.then (() =>
{
    console.log("Amp success");
})
.catch (error =>
{
    console.log ("Amp error: ", error);
});

player.connect()
.then (() =>
{
    console.log("Player success");
})
.catch (error =>
{
    console.log ("Player error: ", error);
});


/// Conversion functions:
///

function amp_InputNameFromDenon(input)
{
    return config.amp_InputNames.find(x=>x.denon === input)?.miniac;
}

function amp_InputNameFromMiniac(input)
{
    return config.amp_InputNames.find(x=>x.miniac === input)?.denon;
}

function playerStatusFromMpd(mpdStatus)
{
    const status = 
    {
        isPlaying: mpdStatus.state === PlayerState.play,
        duration:  mpdStatus.duration,
        elapsed:   mpdStatus.elapsed
    };
    return status;
    
}

function playerSongFromMpd(mpdSong)
{
    const song =
    {
        artist: mpdSong.artist[0],
        album:  mpdSong.album[0],
        title:  mpdSong.title[0]
    };
    return song;
}