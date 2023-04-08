import type { App } from "vue";
import { MiniacOptions } from "./MiniacOptions";
import type { IMiniac } from "./IMiniac";
import { Miniac } from "./Miniac";

export default
{
    install: (app : App, options? : MiniacOptions) =>
    {
        if (options === undefined)
        {
            options = new MiniacOptions();
        }

        console.log("miniac.install: ", options);
        
        const miniac : IMiniac = new Miniac(options);

        app.provide("miniac", miniac);
    }    
}