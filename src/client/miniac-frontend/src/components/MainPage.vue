<script setup lang="ts">
import MainMenu from "./MainMenu.vue";
import Amplifier from "./Amplifier.vue";
import Clock from "./Clock.vue";
import Player from "./Player.vue";

const emit = defineEmits<{(e: 'menu-select', item: string): void }>();
</script>

<template>
  <local-page>
    <MainMenu @menu-select="selection => emit('menu-select', selection)" />
    <Amplifier style="grid-area: amplifier;" />
    <Clock style="grid-area: clock;" />
    <Player style="grid-area: player;" />
  </local-page>
</template>

<style scoped>
local-page
{
  display: grid;
  grid-template-areas: "amplifier menu" "clock clock" "player player";
  gap: 0.5em;
}

/* local-page > *
{
  border: 1px solid var(--color-debug-border);
} */
</style>
