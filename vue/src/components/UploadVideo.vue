<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <div 
      class="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-lg p-20 shadow-lg"
      @dragover.prevent
      @dragenter.prevent
      @drop="handleDrop"
    >
      <i class="fas fa-upload text-6xl text-gray-500 mb-4"></i>
      <p class="text-gray-500">Please drag video here to upload it</p>
      <input type="file" @change="handleFileUpload" class="hidden" ref="fileInput" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { 
  API_PORT,
  selectedProject,
  fps,
} from '../variables';

const fileInput = ref(null);

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (file) {
    await uploadVideo(file);
  }
};

const handleDrop = async (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files?.[0];
  if (file) {
    await uploadVideo(file);
  }
};

const uploadVideo = async (file) => {
  const formData = new FormData();
  const videoElement = document.createElement("video");
  
  videoElement.preload = "metadata";
  videoElement.src = URL.createObjectURL(file);

  videoElement.onloadedmetadata = async () => {
    URL.revokeObjectURL(videoElement.src);
    const duration = videoElement.duration;
    
    //console.log(selectedProject.value.id);

    formData.append("video", file);
    formData.append("durationFPS", Math.round(duration * fps.value));
    formData.append("projectID", selectedProject.value.id);

    try {
      const response = await fetch(`http://localhost:${API_PORT}/api/video/uploadvideo`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        console.log("File uploaded:", data.project);
        selectedProject.value = data.project;
      } else {
        console.error("Failed to upload video");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };
};
</script>
