
<script setup lang="ts">
import IconClose from "./icons/IconClose.vue";
import { ref } from "vue";

const emit = defineEmits<{(e: 'close'): void }>();

const isOpen = ref(false);

function close()
{
    emit("close");
    isOpen.value = false;
}
</script>

<template>
    <page>
        <pagetitle style="grid-area: page-title;">Playlist</pagetitle>
        <button    style="grid-area: close;" class="close" @click="close()"><IconClose /></button>
    </page>
</template>

<style scoped>
page
{
    display: grid;
    grid-template-areas: "page-title close";
    gap: 0.5em;
}
/* page > *
{
  border: 1px solid var(--color-debug-border);
} */

pagetitle
{
    font-size: 3rem;
}

.close
{
    justify-self: right;
}
</style>
