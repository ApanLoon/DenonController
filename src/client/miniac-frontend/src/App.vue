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
</template>

