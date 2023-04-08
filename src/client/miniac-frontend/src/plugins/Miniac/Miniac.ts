import type { IMiniac } from "./IMiniac";
import type { MiniacOptions } from "./MiniacOptions";
import { ref, type Ref } from "vue";

export class Miniac implements IMiniac
{
    public options : MiniacOptions;
    public isConnected : Ref<boolean> = ref(false); 

    public ampIsOn : Ref<boolean> = ref(false); 

    private _socket? : WebSocket;

    public constructor(options : MiniacOptions)
    {
        this.options = options;
    }

    public connect() : void
    {
        console.log(`Miniac: Connecting to ${this.options.host}:${this.options.port}...`);

        this._socket = new WebSocket(`ws://${this.options.host}:${this.options.port}`);

        this._socket.addEventListener("open", () => 
        {
            console.log("Miniac: Connected");

            this.requestAmpPowerState();
        });
        
        this._socket.addEventListener("message", ({ data }) => 
        {
            const msg = JSON.parse(data);
        
            switch (msg.type)
            {
                case "Amp:PowerState": this.ampIsOn.value = msg.isOn; console.log(`Miniac: Amplifier power is ${msg.isOn as boolean === true ? "on" : "in standby"}.`); break;
            }
        });

        this._socket.onclose = error =>
        {
            console.log("Miniac: Connection closed.", error);
            setTimeout(()=>this.connect(), 1000);
        }
    }

    public requestAmpPowerState()
    {
        this._socket?.send(JSON.stringify({ type: "Amp:RequestPowerState" }));
    }

    requestAmpPowerOn() : void
    {
        this._socket?.send(JSON.stringify({ type: "Amp:SetPowerState", isOn: true }));
    }

    requestAmpPowerOff() : void
    {
        this._socket?.send(JSON.stringify({ type: "Amp:SetPowerState", isOn: false }));
    }

    requestAmpPowerToggle() : void
    {
        this.ampIsOn.value ? this.requestAmpPowerOff() : this.requestAmpPowerOn();
    }
}