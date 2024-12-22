<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-zinc-800 p-2 flex justify-between items-center rounded-lg">
      <div class="flex items-center">
        <i class="fas fa-user-circle text-2xl mr-2"></i>
        <h1 class="text-xl font-bold">{{ username }}</h1>
      </div>
    </header>
    <main class="flex-1 p-4">
      <h2 class="text-2xl font-bold mb-4">Your Projects</h2>
      <div v-if="projects.length === 0" class="text-zinc-600">
        No projects found.
      </div>
      <ul v-else class="space-y-2">
        <li v-for="(project, index) in projects" :key="project.id"
          :class="{ 'bg-zinc-800': index === selectedProjectIndex }" class="p-4 border rounded shadow">
          <h3 class="text-xl font-semibold">{{ project.name }}</h3>
          <p v-if="project.video">Video: {{ project.video.fileName }}</p>
        </li>
      </ul>
    </main>

    <div v-if="showNewProjectOverlay" class="ontopdiv">
      <h1 class="text-center font-bold text-l">New Project</h1>
      <input v-model="newProjectName" type="text" class="button mt-4" placeholder="Enter project name"
        @keyup.enter="createNewProject" @keyup.esc="showNewProjectOverlay = false" />
    </div>
  </div>
</template>

<script setup>
import {
  ref,
  onMounted, 
  onUnmounted,
} from 'vue';
import { useRouter } from 'vue-router';
import {
  API_PORT,
  username,
  projects,
} from '../variables';

const router = useRouter();
const showNewProjectOverlay = ref(false);
const newProjectName = ref('');
const selectedProjectIndex = ref(-1);

const handleKeyPress = (event) => {
  if (showNewProjectOverlay.value == false) {
    if (event.key === 'n') {
      showNewProjectOverlay.value = true;
    } else if (event.key === 'ArrowDown') {
      if (selectedProjectIndex.value < projects.value.length - 1) {
        selectedProjectIndex.value++;
      }
    } else if (event.key === 'ArrowUp') {
      if (selectedProjectIndex.value > 0) {
        selectedProjectIndex.value--;
      }
    } else if (event.key === 'Enter' && selectedProjectIndex.value !== -1) {
      openProject(selectedProjectIndex.value);
    }
  } else if (showNewProjectOverlay.value == true) {
    if (event.key === 'Escape') {
      showNewProjectOverlay.value = false;
    } else if (event.key === 'Enter') {
      createNewProject();
      showNewProjectOverlay.value = false;
      newProjectName.value = '';
    }
  }
};

const createNewProject = () => {
  projects.value.push({
    name: newProjectName.value,
    video: null,
    track: {
      segments: []
    },
  });
};

const openProject = (index) => {
  const project = projects.value[index];
  router.push(`/${username.value}/${project.name}`);
};


const fetchProjects = async () => {
  try {
    const response = await fetch(`http://localhost:${API_PORT}/api/project`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      projects.value = data;
    } else {
      console.error('Failed to fetch projects');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress);
  fetchProjects();
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress);
});
</script>