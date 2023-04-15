
<script setup lang="ts">
import type { IMiniac } from "@/plugins/Miniac/IMiniac";
import IconClose from "./icons/IconClose.vue";
import { ref, onMounted, inject, watch } from "vue";

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("PlaylistPage.setup: No miniac plugin found.");
}

const emit = defineEmits<{(e: 'close'): void }>();

const isOpen = ref(false);

onMounted(() => 
{
    miniac.player_RequestPlaylist();
});

watch(() => miniac.player_Status.index, index => scrollToSong(index), { flush: "post"});
watch(() => miniac.player_Playlist, list => scrollToSong(miniac.player_Status.index, false), { deep: true, flush: "post" });

function scrollToSong(index : number, smooth : boolean = true)
{
    const container = document.getElementsByTagName("local-song-container")[0];
    const song = container.children.item(index);
    song?.scrollIntoView({ behavior: smooth ? "smooth" : "auto" });
}

function close()
{
    emit("close");
    isOpen.value = false;
}
</script>

<template>
    <local-page>
        <local-pagetitle      style="grid-area: page-title;">Playlist</local-pagetitle>
        <button               style="grid-area: close;" class="close" @click="close()"><IconClose /></button>
        <local-song-container style="grid-area: list;">
            <div v-for="(song, index) in miniac.player_Playlist"
                 class="song"
                 :class="{ active : index === miniac.player_Status.index } ">
                <div style="grid-area: title;"  class="title" >{{ song.title  }}</div>
                <div style="grid-area: artist;" class="artist">{{ song.artist }}</div>
                <div style="grid-area: album;"  class="album" >{{ song.album  }}</div>
            </div>
        </local-song-container>
    </local-page>
</template>

<style scoped>
local-page
{
    display: grid;
    grid-template-areas: "page-title close"
                         "list list";
    grid-template-rows: 4rem 380px; /*TODO: How do I make the second row fill the rest of the vp height and still be scrollable? */
    gap: 0.5em;
}
/* local-page > *
{
  border: 1px solid var(--color-debug-border);
} */

local-pagetitle
{
    font-size: 2rem;
}

.close
{
    justify-self: right;
}

local-song-container
{
    overflow: scroll;
    min-height: 0;
}

.song
{
    padding-left:   0.2rem;
    padding-right:  0.2rem;
    padding-top:    0.1rem;
    padding-bottom: 0.1rem;

    display: grid;
    grid-template-areas: "title title"
                         "artist album";
    gap: 0.5rem;
}

.song:nth-child(odd)
{
    background-color: var(--color-background-mute);
}
.active
{
    color: var(--color-text-active) !important;
    background-color: var(--color-background-active) !important;
}

.title
{
    font-size: 1rem;
}
.artist
{
    font-size: 0.8rem;
}

.album
{
    font-size: 0.8rem;
    justify-self: right;
}
</style>
