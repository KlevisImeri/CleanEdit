<template>
	<div>

		<div class="flex flex-col justify-center items-center">
			<div class="flex">
				<button @click="openVideo" class="rounded-lg border bg-red-300 m-2 px-4 py-2">
					Open Video
				</button>
				<button @click="openProject" class="rounded-lg border bg-red-300 m-2 px-4 py-2">
					Open Project
				</button>
			</div>

			<div class="text-gray-200">
				<p v-if="selectedVideo">Selected Video: {{ selectedVideo.name }}</p>
				<p v-if="fps && selectedProject">FPS: {{ fps }}</p>
				<p v-if="selectedProject">Selected Project: {{ selectedProject.name }}</p>
				<p v-if="selectedVideo && selectedProject && selectedVideo.name != projectVideoName" class="text-red-400">
					Project video [{{ projectVideoName }}] doesn't match with video [{{ selectedVideo.name }}]
				</p>
			</div>

		</div>


		<Video v-if="videoUrl" />
		<!-- <VidoeCanvas v-if="videoUrl" /> -->
		<Timeline />

		<div class="flex justify-center">
			<button @click="exportCutPoints" class="rounded-lg border bg-green-300 m-2 px-4 py-2 bg">
				Export Cut Points
			</button>
		</div>

	</div>
</template>

<script setup lang="ts">
import Timeline from '@/components/Timeline.vue'
import Video from '@/components/Video.vue'
import VidoeCanvas from '@/components/VideoCanvas.vue'

import {
	selectedVideo,
	selectedProject,
	projectVideoName,
	cutPoints,
	fps,
	currentFrame,
	videoUrl,
	videoElement,
} from '@/variables';

import {
	openVideo,
	openProject,
	exportCutPoints
} from '@/fileUtil'

import {
	onMounted,
	onUnmounted,
	nextTick,
} from 'vue'


// Listen for the 'W' key to add cut points
const onKeyDown = (event: KeyboardEvent) => {
	if (event.key === 'w' && currentFrame.value) {
		cutPoints.value.push(currentFrame.value);
		console.log('Cut at:', currentFrame.value);
	}

	if (event.key === ' ') {
		event.preventDefault();
		if (videoElement.value) {
			if (videoElement.value.paused) {
				videoElement.value.play();
			} else {
				videoElement.value.pause();
			}
		}
	}
};

// Set up the event listener when the component mounts
onMounted(() => {
	window.addEventListener('keydown', onKeyDown);
});

// Clean up the event listener when the component unmounts
onUnmounted(() => {
	window.removeEventListener('keydown', onKeyDown);
});
</script>
