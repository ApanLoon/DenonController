
import { DenonOptions, DenonDevice, DenonEvent } from "./Denon.js";
import { MiniacApi, MiniacEvent } from "./MiniacApi.js";

console.log ("App: Starting up...");

const amp_InputNames =
[
    {denon: "TUNER"    , miniac: "TUNER"},
    {denon: "DVD"      , miniac: "DVD"},
    {denon: "BD"       , miniac: "BD"},
    {denon: "TV"       , miniac: "TV"},
    {denon: "SAT/CBL"  , miniac: "SAT/CBL"},
    {denon: "MPLAY"    , miniac: "SHIELD"},
    {denon: "GAME"     , miniac: "MINIAC"},
    {denon: "AUX1"     , miniac: "AUX1"},
    {denon: "NET"      , miniac: "NET"},
    {denon: "PANDORA"  , miniac: "PANDORA"},
    {denon: "SIRIUSXM" , miniac: "SIRIUSXM"},
    {denon: "LASTFM"   , miniac: "LASTFM"},
    {denon: "FLICKR"   , miniac: "FLICKR"},
    {denon: "FAVORITES", miniac: "FAVORITES"},
    {denon: "IRADIO"   , miniac: "IRADIO"},
    {denon: "SERVER"   , miniac: "SERVER"},
    {denon: "USB/IPOD" , miniac: "USB/IPOD"},
    {denon: "USB"      , miniac: "USB"},
    {denon: "IPD"      , miniac: "IPD"},
    {denon: "IRP"      , miniac: "IRP"},
    {denon: "FVP"      , miniac: "FVP"}
];

function amp_InputNameFromDenon(input)
{
    return amp_InputNames.find(x=>x.denon === input)?.miniac;
}

function amp_InputNameFromMiniac(input)
{
    return amp_InputNames.find(x=>x.miniac === input)?.denon;
}

const miniacApi = new MiniacApi();
const denon = new DenonDevice({ host: "192.168.0.52", port: 23 });

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
