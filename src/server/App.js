
import { DenonOptions, DenonDevice, DenonEvent, DenonInput } from "./Denon.js";
import { MpdOptions, MpdClient, MpdEvent, PlayerState } from "./MpdClient.js";
import { MiniacApi, MiniacEvent } from "./MiniacApi.js";

console.log ("App: Starting up...");

const config =
{
    amp_Host: "192.168.0.52",
    amp_Port: 23,
    amp_InputNames:
    [
        {denon: DenonInput.Phono      , miniac: "PHONO"     },
        {denon: DenonInput.Cd         , miniac: "CD"        },
        {denon: DenonInput.Dvd        , miniac: "DVD"       },
        {denon: DenonInput.Bluray     , miniac: "BLURAY"    },
        {denon: DenonInput.Tv         , miniac: "TV"        },
        {denon: DenonInput.SatCbl     , miniac: "SAT/CBL"   },
        {denon: DenonInput.MediaPlayer, miniac: "SHIELD"    },
        {denon: DenonInput.Game       , miniac: "MINIAC"    },
        {denon: DenonInput.Tuner      , miniac: "TUNER"     },
        {denon: DenonInput.HdRadio    , miniac: "HDRADIO"   },
        {denon: DenonInput.IRadio     , miniac: "IRADIO"    },
        {denon: DenonInput.Server     , miniac: "SERVER"    },
        {denon: DenonInput.Favorites  , miniac: "FAVORITES" },
        {denon: DenonInput.Aux1       , miniac: "AUX1"      },
        {denon: DenonInput.Aux2       , miniac: "AUX2"      },
        {denon: DenonInput.Aux3       , miniac: "AUX3"      },
        {denon: DenonInput.Aux4       , miniac: "AUX4"      },
        {denon: DenonInput.Aux5       , miniac: "AUX5"      },
        {denon: DenonInput.Aux6       , miniac: "AUX6"      },
        {denon: DenonInput.Aux7       , miniac: "AUX7"      },
        {denon: DenonInput.Net        , miniac: "NET"       },
        {denon: DenonInput.Bluetooth  , miniac: "BLUETOOTH" }
    ],

    player_Host: "miniac.local",
    player_Port: 6600
}

const miniacApi = new MiniacApi();
const amp    = new DenonDevice({ host: config.amp_Host,    port: config.amp_Port });
const player = new MpdClient  ({ host: config.player_Host, port: config.player_Port });

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
        isPlaying: mpdStatus.state === PlayerState.play
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