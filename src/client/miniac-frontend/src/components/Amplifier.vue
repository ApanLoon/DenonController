<script setup lang="ts">
import { inject, computed } from "vue";
import type {IMiniac} from "../plugins/Miniac/IMiniac";
import IconPower from "./icons/IconPower.vue";

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("Amplifier.setup: No miniac plugin found.");
}

const amp_SelectedInput = computed(() =>
{
  return miniac.amp_IsOn.value ? miniac.amp_SelectedInput.value : "";
});
</script>

<template>
  <div class="amplifier">
    <button class="power-button"
            :class="{'power-on': miniac.amp_IsOn.value}"
            style="grid-area: power-button;"
            @click="miniac.amp_RequestPowerToggle()"><IconPower /></button>
    <div style="grid-area: input;">{{ amp_SelectedInput }}</div>
    <div style="grid-area: x;"></div>
    <div style="grid-area: y;"></div>
  </div>
</template>

<style scoped>
.amplifier
{
  font-size: 0.6rem;
  display: grid;
  grid-template-columns: 4.5rem auto;
  grid-template-areas: 
    "power-button input"
    "power-button x"
    "power-button y"
  ;
}

.power-button
{
    display: inline-block;
    background-color: black;
    border: 2px solid var(--color-text);
    border-radius: 50%;
    color: #333;
    width: 4rem;
    height: 4rem;
    margin-right: 0.5rem;
}

.power-on svg
{
    color: blue;
    filter: drop-shadow(0 0 0.2rem currentColor);
}
</style>
