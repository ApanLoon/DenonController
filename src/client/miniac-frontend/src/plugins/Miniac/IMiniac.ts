import type { Ref } from "vue";
import type { MiniacOptions } from "./MiniacOptions";

export interface IMiniac
{
    options? : MiniacOptions;
    isConnected : Ref<boolean>; 

    ampIsOn : Ref<boolean>;

    connect() : void;

    requestAmpPowerOn() : void;
    requestAmpPowerOff() : void;
    requestAmpPowerToggle() : void;
}