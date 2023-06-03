<script setup lang="ts">
import type { IMiniac } from '@/plugins/Miniac/IMiniac';
import { inject } from 'vue';
import IconBluetooth from "./icons/IconBluetooth.vue";
import IconRadio from './icons/IconRadio.vue';

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("Bluetooth.setup: No miniac plugin found.");
}
</script>

<template>
    <div class="bluetooth">
        <button :class="{'power-on': miniac.bluetooth_status.isPowered }"
                @click="miniac.bluetooth_SetPowered (!miniac.bluetooth_status.isPowered)">
            <IconBluetooth />
        </button>
        <button :class="{'power-on': miniac.bluetooth_status.isDiscoverable }"
                @click="miniac.bluetooth_SetDiscoverable (!miniac.bluetooth_status.isDiscoverable)">
            <IconRadio />
        </button>
        <div>{{ miniac.bluetooth_status.connectedTo }}</div>
        </div>
</template>

<style scoped>
.bluetooth
{
  font-size: 0.6rem;
  display: grid;
  grid-template-columns: 4rem 4rem auto;
  gap: 0.5rem;
}

.power-on svg
{
    color: var(--color-power);
    filter: drop-shadow(0 0 0.2rem currentColor);
}
</style>