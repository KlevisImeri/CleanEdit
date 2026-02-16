<template>
    <router-view class="p-4"></router-view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from './api/client';
import { username } from './variables';

const router = useRouter();

const checkToken = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await api.post('/api/user/validate-token');
      if (response.status === 200) {
        username.value = response.data.username;
        router.push(`/${response.data.username}`);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  } else {
    router.push('/login');
  }
};

onMounted(() => {
  checkToken();
});
</script>