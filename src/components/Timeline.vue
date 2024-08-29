<script setup lang="ts">
import { 
  ref, 
  computed,
} from 'vue';

import {
  tracks,
  totalDuration,
  UNITSEC,
  zoomLevel,
  fps
} from '@/variables';

import type { 
  Track, 
} from '@/types';


const scrollPosition = ref<number>(0);
const timelineRef = ref<HTMLElement | null>(null);
const fpsToPx = computed(() => 1/fps.value * UNITSEC * zoomLevel.value);
const secToPos = computed(() => 60 * fpsToPx.value); 
const timelineWidth = computed(() => totalDuration.value * fpsToPx.value);
const timeMarkers = computed(() => {
  const markers: number[] = [];
  const step = 10 / zoomLevel.value;
  for (let i = 0; i <= totalDuration.value / fps.value; i += step) {
    markers.push(i);
  }
  return markers;
});
const tickMarks = computed(() => {
  const ticks: number[] = [];
  const tickInterval = 1 / zoomLevel.value; // Tick marks every second
  for (let i = 0; i <= totalDuration.value/fps.value; i += tickInterval) {
    ticks.push(i);
  }
  return ticks;
});

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const zoom = (factor: number, mouseX: number) => {
  const timeline = timelineRef.value;
  if (!timeline) return;

  const rect = timeline.getBoundingClientRect();
  const mousePositionRatio = (mouseX - rect.left + timeline.scrollLeft) / timelineWidth.value;

  zoomLevel.value *= factor;
  zoomLevel.value = Math.max(0.1, Math.min(zoomLevel.value, 10)); 

  timeline.scrollLeft = mousePositionRatio * timelineWidth.value - mouseX + rect.left;
};

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 0.9 : 1.1;
    zoom(factor, event.clientX);
  } else {
    const timeline = timelineRef.value;
    if (timeline) {
      timeline.scrollLeft += event.deltaY;
    }
  }
};
const handleScroll = (event: Event) => {
  const target = event.target as HTMLElement;
  scrollPosition.value = target.scrollLeft;
};

const segmentStyle = (right : number, left: number): { left: string; right: string; } => {
  return {
    left: `${left * fpsToPx.value}px`,
    right: `${right * fpsToPx.value}px`,
  };
};
</script>

<template>
  <div class="w-full bg-gray-800 text-white font-sans">
    <div class="flex items-center p-2">
      <span class="ml-auto">{{ formatTime(scrollPosition/secToPos) }} / {{ formatTime(totalDuration/fps) }}</span>
    </div>

    <div ref="timelineRef" class="relative h-50 overflow-x-auto p-2 bg-gray-700 rounded-lg" @wheel="handleWheel" @scroll="handleScroll"> 
      <div :style="{ width: `${timelineWidth }px` }">

        <!-- Time Markers -->
        <div class="relative h-5 ">
          <span v-for="marker in timeMarkers" :key="marker" 
                class="absolute text-xs text-gray-300" 
                :style="{ left: `${marker * secToPos}px` }">
            {{ formatTime(marker) }}
          </span>
        </div>


        <!-- Tick Marks -->
        <div class="relative h-4  border-b  border-gray-600">
          <div v-for="tick in tickMarks" :key="tick" 
              class="absolute border-l border-gray-500"
              :style="{ left: `${tick * secToPos}px`, height: '100%' }">
          </div>
        </div>

        <!-- Segments -->
        <div class="mt-2 mb-2">
          <div v-for="(track, index) in tracks" :key="index" class="relative h-10 mt-1 mb-1">
            <div v-for="(cut, index) in track.cuts" :key="cut">
              <div 
                  class="absolute h-full rounded px-1 py-0.5 text-xs whitespace-nowrap overflow-hidden overflow-ellipsis border border-gray-400 "
                  :class="track.isCut[index] ? `bg-gray-500` : `bg-red-400`"
                  :style="segmentStyle(cut, track.cuts[index+1])">
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  </div>
</template>
