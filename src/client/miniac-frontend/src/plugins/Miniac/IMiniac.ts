import type { Ref } from "vue";
import type { MiniacOptions } from "./MiniacOptions";

export interface IMiniac
{
    options? : MiniacOptions;
    isConnected : Ref<boolean>; 

    amp_IsOn          : Ref<boolean>;
    amp_SelectedInput : Ref<string>;

    connect(connectHandler? : () => void) : void;

    amp_RequestPowerState() : void;
    amp_RequestPowerOn() : void;
    amp_RequestPowerOff() : void;
    amp_RequestPowerToggle() : void;

    amp_RequestSelectedInput() : void;
    amp_SetSelectedInput(input : string) : void;
}