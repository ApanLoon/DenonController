import type { IMiniac } from "./IMiniac";
import type { MiniacOptions } from "./MiniacOptions";
import { ref, type Ref } from "vue";

export class Miniac implements IMiniac
{
    public options : MiniacOptions;
    public isConnected : Ref<boolean> = ref(false); 

    public amp_IsOn          : Ref<boolean> = ref(false);
    public amp_SelectedInput : Ref<string>  = ref("");

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
                case "Amp:PowerState":    this.amp_IsOn.value          = msg.isOn;  console.log(`Miniac: Amplifier power is ${msg.isOn as boolean === true ? "on" : "in standby"}.`); break;
                case "Amp:SelectedInput": this.amp_SelectedInput.value = msg.input; console.log(`Miniac: Amplifier input is ${msg.input}.`); break;
            }
        });

        this._socket.onclose = error =>
        {
            console.log("Miniac: Connection closed.", error);
            setTimeout(()=>this.connect(connectHandler), 1000);
        }
    }

    public amp_RequestPowerState() : void
    {
        console.log("Miniac.amp_RequestPowerState");
        this._socket?.send(JSON.stringify({ type: "Amp:RequestPowerState" }));
    }

    amp_RequestPowerOn() : void
    {
        console.log("Miniac.amp_RequestPowerOn");
        this._socket?.send(JSON.stringify({ type: "Amp:SetPowerState", isOn: true }));
    }

    amp_RequestPowerOff() : void
    {
        console.log("Miniac.amp_RequestPowerOff");
        this._socket?.send(JSON.stringify({ type: "Amp:SetPowerState", isOn: false }));
    }

    amp_RequestPowerToggle() : void
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

}