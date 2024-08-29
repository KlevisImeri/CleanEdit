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

    <video ref="videoElement" v-if="videoUrl" :src="videoUrl" controls class="mt-4 w-full"></video>

    <Timeline/>

    <div class="flex justify-center">
      <button @click="exportCutPoints" class="rounded-lg border bg-green-300 m-2 px-4 py-2">
        Export Cut Points
      </button>
    </div>

  </div>
</template>

<script setup lang="ts">
import Timeline from '@/components/Timeline.vue'

import {
  selectedVideo,
  videoUrl,
  selectedProject,
  projectVideoName,
  cutPoints,
  videoElement,
  fps,
} from '@/variables';

import {
  openVideo,
  openProject,
  exportCutPoints
} from '@/fileUtil'

import {
  onMounted,
  onUnmounted
} from 'vue'

// Listen for the 'W' key to add cut points
const onKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'w' && videoElement.value) {
    const currentTime = videoElement.value.currentTime;
    cutPoints.value.push(currentTime);
    console.log('Cut at:', currentTime);
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
