<template>
    <div class="flex-1 flex flex-col justify-center items-center">

      <div class="flex">
        <button @click="openVideo" class="button">
          Open Video
        </button>
        <button @click="openProject" class="button">
          Open Project
        </button>
        <div class="flex justify-center">
          <button @click="exportCutPoints" class="button">
            Export Cut Points
          </button>
        </div>
      </div>

      <Video v-if="videoUrl" />
      <Timeline/>
    </div>

    <div v-if="showShortcuts" class="ontopdiv">
      <h1 class="text-center font-bold text-l text-gray-300">Shortcuts</h1>
      <p>Ctrl+s -> save cut points</p>
      <p>E -> remove segment</p>
      <p>Space -> pause/unpause</p>
      <p>Ctrl-click -> click to the position</p>
      <p>Ctrl-mousescroll -> zoom in Timeline</p>
      <p>mousescroll -> scroll the Timline</p>
    </div>

    <div v-if="showInformation" class="ontopdiv">
      <h1 class="text-center font-bold text-l text-gray-300">Info</h1>
      <p v-if="selectedVideo">Selected Video: {{ selectedVideo.name }}</p>
      <p v-if="fps && selectedProject">FPS: {{ fps }}</p>
      <p v-if="selectedProject">Selected Project: {{ selectedProject.name }}</p>
      <p v-if="selectedVideo && selectedProject && selectedVideo.name != projectVideoName" class="text-red-400">
        Project video [{{ projectVideoName }}] doesn't match with video [{{ selectedVideo.name }}]
      </p>
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
  showShortcuts,
  showInformation,
  video,
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
	if (event.key === ' ') {
		event.preventDefault();
		if (video.value) {
			video.value.paused ? 
      video.value.play() : 
      video.value.pause();
		}
	} else if (event.ctrlKey && event.key === 's'){
    event.preventDefault();
    exportCutPoints();
  } else if (event.key === 'S') {
    showShortcuts.value = !showShortcuts.value; 
  } else if (event.key === 'I') {
    showInformation.value = !showInformation.value;
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
