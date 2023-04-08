<script setup lang="ts">
import { inject } from "vue";
import type {IMiniac} from "./plugins/Miniac/IMiniac";
import Amplifier from "./components/Amplifier.vue";
import Clock from "./components/Clock.vue";

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("App.setup: No miniac plugin found.");
}
miniac.connect();

</script>

<template>
  <header>
    <Amplifier />
  </header>

  <main>
    <Clock />
  </main>
</template>

<style scoped>
header
{
  line-height: 1.5;
}

@media (min-width: 1024px)
{
  header
  {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }
}
</style>
