<script setup lang="ts">
import { inject } from "vue";
import type {IMiniac} from "../plugins/Miniac/IMiniac";
import IconPrev from "./icons/IconPrev.vue";
import IconPlay from "./icons/IconPlay.vue";
import IconPause from "./icons/IconPause.vue";
import IconNext from "./icons/IconNext.vue";
import IconStop from "./icons/IconStop.vue";

const progressInterval = 500;

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("Player.setup: No miniac plugin found.");
}

setInterval(()=>{ if (miniac.player_Status.isPlaying) miniac.player_Status.elapsed += progressInterval/1000; }, progressInterval);

</script>

<template>
  <div class="player">
    <div style="grid-area: song;"   class="song"  >{{ miniac.player_CurrentSong.title   }}</div>
    <div style="grid-area: album;"  class="album" >{{ miniac.player_CurrentSong.album  }}</div>
    <div style="grid-area: artist;" class="artist">{{ miniac.player_CurrentSong.artist }}</div>

    <progress style="grid-area: progress;" :value="miniac.player_Status.elapsed" :max="miniac.player_Status.duration"></progress>

    <button style="grid-area: prev;"
            @click="miniac.player_RequestPrev()">
        <IconPrev />
    </button>

    <button style="grid-area: play;"
            @click="miniac.player_RequestPlayToggle()">
        <IconPlay  v-if="!miniac.player_Status.isPlaying" />
        <IconPause v-if="miniac.player_Status.isPlaying" />
    </button>

    <button style="grid-area: stop;"
            @click="miniac.player_RequestStop()">
        <IconStop />
    </button>

    <button style="grid-area: next;"
            @click="miniac.player_RequestNext()">
        <IconNext />
    </button>
  </div>
</template>

<style scoped>
.player
{
  font-size: 1rem;
  text-align: right;

  display: grid;
  grid-template-areas: 
    "song song song song"
    "artist artist artist artist"
    "album album album album"
    "progress progress progress progress"
    "prev play next stop"
  ;
}

.song
{
    font-size: 2rem;
}
.artist
{
    font-size: 1.5rem;
}
.album
{
    font-size: 0.8rem;
}

progress[value]
{
    /* Reset the default appearance */
    -webkit-appearance: none;
    appearance: none;

    width: 100%;
    height: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}
progress[value]::-webkit-progress-bar
{
  border-radius: 1rem;
  background-color: var(--color-background-mute);
  color: var(--color-text);
}
progress[value]::-webkit-progress-value
{
  border-radius: 1rem;
  background-color: var(--color-text);
}
</style>
