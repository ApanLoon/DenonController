
<script setup lang="ts">
import type { IMiniac } from "@/plugins/Miniac/IMiniac";
import MainMenu from "./MainMenu.vue";
import { ref, onMounted, inject } from "vue";

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("LibraryPage.setup: No miniac plugin found.");
}

const emit = defineEmits<{(e: 'menu-select', item: string): void }>();

const isOpen = ref(false);

onMounted(() => 
{
    miniac.player_RequestArtists();
});

function artistSelected()
{
    const select = document.getElementById("artist-selector") as HTMLSelectElement;
    if (select == null)
    {
        return;
    }
    const artists = [...select.selectedOptions].map(x=>x.value)
    miniac?.player_RequestAlbums(artists);
}
</script>

<template>
    <local-page>
        <local-pagetitle style="grid-area: page-title;">Library</local-pagetitle>
        <MainMenu @menu-select="selection => emit('menu-select', selection)" />
        <local-header>Artist</local-header>
        <local-header>Album</local-header>
        <select id="artist-selector" multiple @change="artistSelected()">
            <option v-for="artist in miniac.player_Artists">
                {{ artist }}
            </option>
        </select>
        <local-album-container>
            <div v-for="(item, index) in miniac.player_Albums"
                 :class="{ header : item.key === 'artist' } ">
                 {{ item.value }}
            </div>
        </local-album-container>
    </local-page>
</template>

<style scoped>
local-page
{
    display: grid;
    grid-template-areas: "page-title    menu"
                         "artist-header album-header"
                         "artists       albums";
    grid-template-columns: 1fr 1fr;                         
    grid-template-rows: 4rem 2rem 345px; /*TODO: How do I make the third row fill the rest of the vp height and still be scrollable? */
    gap: 0.5em;
}

local-pagetitle
{
    font-size: 2rem;
}
local-header
{
    font-size: 1.5rem;
    border-bottom: 1px solid currentColor;
}

select[multiple]
{
    background-color: var(--color-background);
    color: var(--color-text);
    border: none;
    outline: none;
    font-size: 1.5rem;
}
select[multiple] option
{
    font-weight: normal;
}

select[multiple] option:nth-child(odd)
{
    background-color: var(--color-background-mute);
}

.header
{
    text-align: right;
    color: var(--color-text-active) !important;
    background-color: var(--color-background-active) !important;
}

local-album-container
{
    overflow-y: scroll;
    min-height: 0;
    font-size: 1.5rem;
}
local-album-container > *:nth-child(odd)
{
    background-color: var(--color-background-mute);
}
</style>
