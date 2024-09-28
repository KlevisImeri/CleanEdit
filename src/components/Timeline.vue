<template>

	<div v-if="selectedVideo" class="w-full bg-gray-800 text-white font-sans">
		<div class="flex items-center p-2 ">
			<span class="ml-auto">{{ formatTime(Math.round(currentFrame / fps)) }} / {{ formatTime(totalDuration / fps)
				}}</span>
		</div>
    
    <div class="p-2 bg-gray-700 rounded-lg">
      <div 
      ref="timelineRef" 
      class="relative h-50 overflow-x-auto"
      @wheel="handleWheel"
      @scroll="handleScroll" 
      @click="handleClick">
      <div :style="{ width: `${timelineWidth}px` }">
        
        <!-- Time Markers -->
        <div class="relative h-5 ">
          <span v-for="marker in timeMarkers" :key="marker" 
            class="absolute text-xs text-gray-300 -translate-x-1/2 overflow-visible"
            :style="{ left: `${marker * secToPos}px` }">
            {{ formatTime(marker) }}
          </span>
        </div>
        
  
        <!-- Tick Marks -->
        <div class="relative h-4  border-b  border-gray-600">
          <div v-for="tick in tickMarks" :key="tick" class="absolute border-l border-gray-500"
            :style="{ left: `${tick * secToPos}px`, height: '100%' }">
          </div>
        </div>


        <!-- Segments -->
        <div class="mt-2 mb-2">
          <div v-for="(track, index) in tracks" :key="index" class="relative h-20 mt-1 mb-1">
            <div v-for="(segment, index) in visibleSegments" :key="index"
              class="absolute h-full rounded px-1 py-0.5 text-xs whitespace-nowrap overflow-hidden border border-gray-800"
              :class="segment.removed ? `bg-gray-600` : 'bg-gray-400'" :style="segmentStyle(segment)">
            </div>
          </div>
        </div>

        <!-- Current Time Indicator -->
        <div 
          class="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10" 
          :style="{ left: `calc(${currentFrame * fpsToPx}px)` }">
        </div>
  
        </div>
      </div>    
    </div>

	</div>
</template>

<script setup lang="ts">

import {
	ref,
	computed,
	watch,
} from 'vue';

import {
	tracks,
	totalDuration,
	zoomLevel,
	fps,
	fpsToPx,
	secToPos,
	currentFrame,
	UNITTICK,
	ZOOMMIX,
	ZOOMMAX,
	UNITMARKER,
	ZOOMSPEED,
	selectedProject,
	video,
	curSeg,
	till,
  selectedVideo,
} from '@/variables';

import type {
	Segment,
	Track,
} from '@/types';


const scrollPosition = ref<number>(0.0);
const timelineRef = ref<HTMLElement | null>(null);
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
	const { start, end } = visibleRangeFPS.value;
	return tracks.value.flatMap(track =>
		track.segments.filter(segment => segment.end >= start && segment.start <= end)
	);
});



const timeMarkers = computed(() => {
	const markers: number[] = [];
	const { start, end } = visibleRangeTIME.value;
	const step = UNITMARKER / zoomLevel.value;
	for (let i = start; i <= end; i += step) {
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
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
};

const zoom = (factor: number, mouseX: number) => {
	const timeline = timelineRef.value;
	if (!timeline) return;

	const rect = timeline.getBoundingClientRect();
  timeline.scrollLeft += mouseX;

	zoomLevel.value *= factor;
	zoomLevel.value = Math.max(ZOOMMIX, Math.min(zoomLevel.value, ZOOMMAX));

	timeline.scrollLeft -= mouseX;
};

const handleWheel = (event: WheelEvent) => {
	if (event.ctrlKey) {
		event.preventDefault();
		const factor = event.deltaY > 0 ? 1 - ZOOMSPEED : 1 + ZOOMSPEED;
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

const binarySearch = (track: Track, time: number): number => {
	let low = 0;
	let high = track.segments.length - 1;

	while (low <= high) {
		const mid = Math.floor((low + high) / 2);
		const segment = track.segments[mid];

		if (time >= segment.start && time <= segment.end) {
			return mid; // Found the segment containing the time
		} else if (time < segment.start) {
			high = mid - 1; // Search left
		} else {
			low = mid + 1; // Search right
		}
	}

	return track.segments.length - 1; // Time not found in any segment
};

const handleClick = (event: MouseEvent) => {
	const timeline = timelineRef.value;
	if (!timeline) return;

	const rect = timeline.getBoundingClientRect();
	const clickPositionX = event.clientX - rect.left + timeline.scrollLeft;
	const newTime = clickPositionX / secToPos.value; 
  const newFrame = clickPositionX / fpsToPx.value;

	if (video.value) {
		video.value.currentTime = newTime;
    currentFrame.value = newFrame;
		curSeg.value = binarySearch(tracks.value[0], newFrame)
		console.log(curSeg.value);
		till.value = tracks.value[0].segments[curSeg.value].end;
	}
};

//TODO: optize this you can save the firt and last frame of the visible timeline
watch(currentFrame, (newFrame) => {
	// console.log(`CurrentFrame changed: ${currentFrame.value}`);
	const timeline = timelineRef.value;
	if (!timeline) return;

	// Convert timeline dimensions from pixels to frames
	const timelineWidthInFrames = timeline.clientWidth / fpsToPx.value;
	const timelineLeftInFrames = scrollPosition.value / fpsToPx.value;
	const timelineRightInFrames = timelineLeftInFrames + timelineWidthInFrames;

	// Determine if the new frame is outside the visible range
	if (newFrame < timelineLeftInFrames || newFrame > timelineRightInFrames) {
		// Calculate new scroll position to bring the current frame into view
		const newTimelineLeftInFrames = newFrame - (timelineWidthInFrames * 0.1);
		timeline.scrollLeft = newTimelineLeftInFrames * fpsToPx.value;
		scrollPosition.value = timeline.scrollLeft;
	}
});

</script>
