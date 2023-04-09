
import { DenonOptions, DenonDevice, DenonEvent, DenonInput } from "./Denon.js";
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
    ]
}

function amp_InputNameFromDenon(input)
{
    return config.amp_InputNames.find(x=>x.denon === input)?.miniac;
}

function amp_InputNameFromMiniac(input)
{
    return config.amp_InputNames.find(x=>x.miniac === input)?.denon;
}

const miniacApi = new MiniacApi();
const denon = new DenonDevice({ host: config.amp_Host, port: config.amp_Port });

denon.on(DenonEvent.PowerState,    isOn  => miniacApi.amp_SendPowerState(isOn));
denon.on(DenonEvent.SelectedInput, input => miniacApi.amp_SendSelectedInput(amp_InputNameFromDenon (input)));

miniacApi.on(MiniacEvent.Amp_RequestPowerState,    ()      => denon.requestPowerState());
miniacApi.on(MiniacEvent.Amp_SetPowerState,        (isOn)  => denon.setPowerState(isOn));
miniacApi.on(MiniacEvent.Amp_RequestSelectedInput, ()      => denon.requestSelectedInput());
miniacApi.on(MiniacEvent.Amp_SetSelectedInput,     (input) => denon.setSelectedInput(amp_InputNameFromMiniac (input)));

denon.connect()
.then (() =>
{
    console.log("Success");
})
.catch (error =>
{
    console.log ("Error: ", error);
});
