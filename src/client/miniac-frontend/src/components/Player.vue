<script setup lang="ts">
import { inject, computed } from "vue";
import type {IMiniac} from "../plugins/Miniac/IMiniac";
import IconPrev from "./icons/IconPrev.vue";
import IconPlay from "./icons/IconPlay.vue";
import IconPause from "./icons/IconPause.vue";
import IconNext from "./icons/IconNext.vue";
import IconStop from "./icons/IconStop.vue";

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("Player.setup: No miniac plugin found.");
}
</script>

<template>
  <div class="player">
    <div style="grid-area: song;"   class="song"  >{{ miniac.player_CurrentSong.value   }}</div>
    <div style="grid-area: album;"  class="album" >{{ miniac.player_CurrentAlbum.value  }}</div>
    <div style="grid-area: artist;" class="artist">{{ miniac.player_CurrentArtist.value }}</div>

    <button style="grid-area: prev;">
        <IconPrev />
    </button>

    <button style="grid-area: play;"
            @click="miniac.player_RequestPlayToggle()">
        <IconPlay  v-if="!miniac.player_IsPlaying.value" />
        <IconPause v-if="miniac.player_IsPlaying.value" />
    </button>

    <button style="grid-area: stop;">
        <IconStop />
    </button>

    <button style="grid-area: next;">
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

button
{
    background-color: black;
    border: 2px solid var(--color-text);
    border-radius: 50%;
    color: #333;
    width: 4rem;
    height: 4rem;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    margin-right: 0.5rem;
}

.play-on svg
{
    color: blue;
    filter: drop-shadow(0 0 0.2rem currentColor);
}
</style>
