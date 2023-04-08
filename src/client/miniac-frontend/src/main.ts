import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'
import miniacPlugin from './plugins/Miniac/MiniacPlugin';
import { MiniacOptions } from './plugins/Miniac/MiniacOptions';

const app = createApp(App);
app.use(miniacPlugin, new MiniacOptions(
    {
        host: "localhost",
        port: 4000
    }));

app.mount('#app');