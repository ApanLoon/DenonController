
<script setup lang="ts">
import MainMenu from "./MainMenu.vue";
import { ref } from "vue";

const emit = defineEmits<{(e: 'menu-select', item: string): void }>();

const isOpen = ref(false);
</script>

<template>
    <local-page>
        <local-pagetitle style="grid-area: page-title;">Library</local-pagetitle>
        <MainMenu @menu-select="selection => emit('menu-select', selection)" />
    </local-page>
</template>

<style scoped>
local-page
{
    display: grid;
    grid-template-areas: "page-title menu";
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
</style>
