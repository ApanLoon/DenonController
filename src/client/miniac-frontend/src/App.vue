<script setup lang="ts">
import { inject } from "vue";
import type {IMiniac} from "./plugins/Miniac/IMiniac";
import Amplifier from "./components/Amplifier.vue";
import Clock from "./components/Clock.vue";
import Player from "./components/Player.vue";

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("App.setup: No miniac plugin found.");
}
miniac.connect(() =>
{
  miniac.amp_RequestPowerState();
  miniac.amp_RequestSelectedInput();
  miniac.player_RequestStatus();
  miniac.player_RequestCurrentSong()
});

</script>

<template>
  <main>
    <Amplifier style="grid-area: amplifier;" />
    <Clock style="grid-area: clock;" />
    <Player style="grid-area: player;" />
  </main>
</template>

<style scoped>
main
{
  display: grid;
  grid-template-areas: "amplifier" "clock" "player";
  gap: 1em;
}

main > *
{
  border: 1px solid var(--color-debug-border);
}
</style>
