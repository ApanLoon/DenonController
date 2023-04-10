import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'
import miniacPlugin from './plugins/Miniac/MiniacPlugin';
import { MiniacOptions } from './plugins/Miniac/MiniacOptions';

console.log("main.ts: Getting config...");
fetch("config.json")
.then(response =>
{
    if (!response.ok)
    {
        throw new Error(`${response.status} ${response.statusText}`);
    }

    response.json()
    .then(config =>
    {
        const app = createApp(App);
        app.use(miniacPlugin, new MiniacOptions(config));
        app.mount('#app');
    })
    .catch(error =>
    {
        console.log ("main.ts: Unable to get config. ", error);
    });
})
.catch(error=>
{
    console.log ("main.ts: Unable to get config. ", error);
});
