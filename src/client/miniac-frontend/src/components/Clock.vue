<script setup lang="ts">
import { ref, onMounted } from "vue";

const dayString  = ref("");
const timeString = ref("");
const dateString = ref("");

const dayNames = ["Söndag", "Måndag", "Tisdag", "Onsdag", "Torsdag", "Fredag", "Lördag"];

onMounted(() =>
{
    setInterval(updateTime, 100);
});

function updateTime()
{
    let now = new Date();
    dayString.value = dayNames[now.getDay()];
    timeString.value =       zeroPadding(now.getHours(),   2)
                     + ":" + zeroPadding(now.getMinutes(), 2);
                     //+ ":" + zeroPadding(now.getSeconds(), 2);
    dateString.value = now.getFullYear()
                     + " " + zeroPadding(now.getMonth(), 2)
                     + " " + zeroPadding(now.getDate(),  2);
}

function zeroPadding(num : number, digits : number) : string
{
    let zero = "";
    for (let i = 0; i < digits; i++)
    {
        zero += "0";
    }
    return (zero + num).slice(-digits);
}
</script>

<template>
    <div class="container">
        <div class="day">{{ dayString }}</div>
        <div class="clock"><span>{{ timeString }}</span></div>
        <div class="date">{{ dateString }}</div>
    </div>
</template>

<style scoped>
.container
{
    text-align: center;
}
.day
{
    font-size: 2rem;
}
.clock
{
    border-top: 1px solid currentColor;
    border-bottom: 1px solid currentColor;
    font-size: 7rem;
    line-height: 5.5rem;
}
.clock span
{
    position: relative;
    bottom: 0.4rem;
}

.date
{
    font-size: 2rem;
}
</style>