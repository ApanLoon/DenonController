<script setup lang="ts">
import { inject } from "vue";
import type {IMiniac} from "../plugins/Miniac/IMiniac";
import IconPower from "./icons/IconPower.vue";

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("App.setup: No miniac plugin found.");
}
</script>

<template>
  <div class="amplifier">
    <button class="power-button"
            :class="{'power-on': miniac.ampIsOn.value}"
            @click="miniac.requestAmpPowerToggle()"><IconPower /></button>
  </div>
</template>

<style scoped>
.amplifier
{
  text-align: center;
}

.power-button
{
    background-color: black;
    border: 2px solid gray;
    border-radius: 50%;
    color: #333;
    width: 4rem;
    height: 4rem;
    text-align: center;
    text-decoration: none;
    display: inline-block;
}

.power-on svg
{
    color: blue;
    filter: drop-shadow(0 0 0.2rem currentColor);
}
</style>
