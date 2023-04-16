<script setup lang="ts">
import { inject, provide, ref } from "vue";
import type {IMiniac} from "./plugins/Miniac/IMiniac";
import MainPage from "./components/MainPage.vue";
import PlaylistPage from "./components/PlaylistPage.vue";
import LibraryPage from "./components/LibraryPage.vue";

const currentPage = ref("main");
provide("current-page", currentPage);

const miniac = inject<IMiniac>("miniac");
if (miniac === undefined)
{
  throw new Error ("App.setup: No miniac plugin found.");
}
miniac.connect(() =>
{
  miniac.amp_RequestPowerState();
  miniac.amp_RequestSelectedInput();
  miniac.player_RequestStatus();
  miniac.player_RequestCurrentSong()
});

function selectPage(page : string) :void
{
  currentPage.value = page;
}

function closePage() : void
{
  currentPage.value = "main";
}
</script>

<template>
  <main>
    <MainPage     v-if="currentPage === 'main'"     @menu-select="page => selectPage(page)"></MainPage>
    <PlaylistPage v-if="currentPage === 'playlist'" @close="closePage()"></PlaylistPage>
    <LibraryPage  v-if="currentPage === 'library'"  @close="closePage()"></LibraryPage>
  </main>
  <Transition>
    <div class="noconnection" v-if="miniac.isConnected.value === false">Not connected</div>
  </Transition>
</template>

<style scoped>

.noconnection
{
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;

  display: flex;
  width: 100vw;
  height: 100vh;

  align-items: center;
  justify-content: center;

  background-color: var(--color-background-mute);
  opacity: 0.9;

  font-size: 7rem;
}

.v-enter-active,
.v-leave-active
{
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to
{
  opacity: 0;
}
</style>
