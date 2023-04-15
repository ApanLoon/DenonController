
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
    <local-page>
        <local-pagetitle style="grid-area: page-title;">Library</local-pagetitle>
        <button    style="grid-area: close;" class="close" @click="close()"><IconClose /></button>
    </local-page>
</template>

<style scoped>
local-page
{
    display: grid;
    grid-template-areas: "page-title close";
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
</style>
