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
  fps,
  UNITTICK,
  ZOOMMIX,
  ZOOMMAX,
  UNITMARKER,
  ZOOMSPEED
} from '@/variables';

import type {
  Segment,
} from '@/types';


const scrollPosition = ref<number>(0);
const timelineRef = ref<HTMLElement | null>(null);
const fpsToPx = computed(() => 1/fps.value * UNITSEC * zoomLevel.value);
const secToPos = computed(() => 60 * fpsToPx.value); 
const timelineWidth = computed(() => totalDuration.value * fpsToPx.value);

const visibleRangeFPS = computed(() => {
  const timeline = timelineRef.value;
  if (!timeline) return { start: 0, end: 0 };
  const left = scrollPosition.value;
  const right = left + timeline.clientWidth;
  const start = left / fpsToPx.value;
  const end = right / fpsToPx.value;
  return { start, end };
});

const visibleRangeTIME = computed(() => {
  const timeline = timelineRef.value;
  if (!timeline) return { start: 0, end: 0 };
  const left = scrollPosition.value;
  const right = left + timeline.clientWidth;
  const start = left / secToPos.value;
  const end = right / secToPos.value;
  return { start, end };
});


const visibleSegments = computed(() => {
  const { start, end } = visibleRangeFPS.value; // Ensure visibleRange is a reactive reference or computed property
  return tracks.value.flatMap(track =>
    track.segments.filter(segment => segment.end >= start && segment.start <= end)
  );
});



const timeMarkers = computed(() => {
  const markers: number[] = [];
  const { start, end } = visibleRangeTIME.value; 
  const step = UNITMARKER / zoomLevel.value;
  for (let i = start ; i <= end; i += step) {
    markers.push(i);
  }
  return markers;
});
const tickMarks = computed(() => {
  const ticks: number[] = [];
  const { start, end } = visibleRangeTIME.value; 
  const tickInterval = UNITTICK / zoomLevel.value; // Tick marks every second
  for (let i = start; i <= end; i += tickInterval) {
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
  zoomLevel.value = Math.max(ZOOMMIX, Math.min(zoomLevel.value, ZOOMMAX)); 

  timeline.scrollLeft = mousePositionRatio * timelineWidth.value - mouseX + rect.left;
};

const handleWheel = (event: WheelEvent) => {
  if (event.ctrlKey) {
    event.preventDefault();
    const factor = event.deltaY > 0 ? 1-ZOOMSPEED : 1+ZOOMSPEED;
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

const segmentStyle = (segment: Segment): { left: string; width: string; } => {
  const left = segment.start * fpsToPx.value;
  const width = (segment.end - segment.start) * fpsToPx.value;
  return {
    left: `${left}px`,
    width: `${width}px`,
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
          <div v-for="(track, index) in tracks" :key="index" class="relative h-20 mt-1 mb-1">
            <div v-for="(segment, index) in visibleSegments" :key="index"
                class="absolute h-full rounded px-1 py-0.5 text-xs whitespace-nowrap overflow-hidden overflow-ellipsis border border-gray-800"
                :class="segment.removed ? `bg-red-400` : 'bg-gray-400'"
                :style="segmentStyle(segment)">
            </div>
          </div>
        </div>


        
      </div>
    </div>
  </div>
</template>
