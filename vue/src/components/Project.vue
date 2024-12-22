<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-zinc-800 p-2 flex justify-between items-center rounded-lg">
      <div class="flex items-center">
        <i class="fas fa-project-diagram text-2xl mr-2"></i>
        <h1 class="text-xl font-bold">{{ selectedProject?.name }}</h1>
      </div>
    </header>
    <Editor v-if="selectedProject?.video" />
    <UploadVideo v-else />
     <!-- <UploadVideo/> -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { projects, selectedProject } from '../variables';
import UploadVideo from './UploadVideo.vue';
import Editor from './Editor.vue';

const route = useRoute();

onMounted(() => { 
  const projectName = route.params.projectName;
  selectedProject.value = projects.value.find(p => p.name === projectName);
});
</script>