
import { DenonOptions, DenonDevice, DenonEvent } from "./Denon.js";
import { MiniacApi, MiniacEvent } from "./MiniacApi.js";

console.log ("App: Starting up...");

const miniacApi = new MiniacApi();
const denon = new DenonDevice({ host: "192.168.0.52", port: 23 });

denon.on(DenonEvent.PowerState, isOn => miniacApi.sendAmpPowerState(isOn));

miniacApi.on(MiniacEvent.RequestAmpPowerState, ()     => denon.requestPowerState());
miniacApi.on(MiniacEvent.SetAmpPowerState,     (isOn) => denon.setPowerState(isOn));

denon.connect()
.then (() =>
{
    console.log("Success");
})
.catch (error =>
{
    console.log ("Error: ", error);
});



