<script setup lang="ts">
import IconMenu from "./icons/IconMenu.vue";
import { inject, ref } from "vue";

const emit = defineEmits<{(e: 'menu-select', item: string): void }>();

const currentPage = inject("current-page");

const isOpen = ref(false);

function select(selection : string)
{
    emit("menu-select", selection);
    isOpen.value = false;
}
</script>

<template>
    <button style="grid-area: menu;" @click="isOpen = !isOpen"><IconMenu /></button>
    <menu v-if="isOpen">
        <div @click="select('main')"     :class="{selected : currentPage == 'main'    }">Main</div>
        <div @click="select('playlist')" :class="{selected : currentPage == 'playlist'}">Playlist</div>
        <div @click="select('library')"  :class="{selected : currentPage == 'library' }">Library</div>
    </menu>
</template>

<style scoped>
button
{
    justify-self: right;
}

menu
{
    position: absolute;
    right: 4.5rem;
    z-index: 1;
    background-color: var(--color-background);
    border: 1px solid var(--color-text);
    font-size: 2rem;
    text-align: right;
    padding-right: 1rem;
}

.selected
{
    color: var(--color-background-mute);
}
</style>
