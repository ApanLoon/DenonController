<script setup lang="ts">
import { inject, computed } from "vue";
import type {IMiniac} from "../plugins/Miniac/IMiniac";
import IconPower from "./icons/IconPower.vue";
import IconNotes from "./icons/IconNotes.vue";

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
    <button :class="{'power-on': miniac.amp_IsOn.value}"
            style="grid-area: power;"
            @click="miniac.amp_RequestPowerToggle()">
      <IconPower />
    </button>
    <div style="grid-area: input;">{{ amp_SelectedInput }}</div>
    <div style="grid-area: x;"></div>
    <div style="grid-area: y;"></div>
    <button :class="{'power-on': amp_SelectedInput === 'MINIAC'}"
            style="grid-area: selector;"
            @click="miniac.amp_SetSelectedInput('MINIAC')">
      <IconNotes />
    </button>
  </div>
</template>

<style scoped>
.amplifier
{
  font-size: 0.6rem;
  display: grid;
  grid-template-columns: 4.5rem auto 4rem;
  grid-template-areas: 
    "power input selector"
    "power x     selector"
    "power y     selector"
  ;
}

button
{
    display: inline-block;
    background-color: black;
    color: #333;
    border: 2px solid var(--color-text);
    border-radius: 50%;
    width: 4rem;
    height: 4rem;

    text-align: center;
    text-decoration: none;
}

.power-on svg
{
    color: blue;
    filter: drop-shadow(0 0 0.2rem currentColor);
}
</style>
