<template>
    <router-view class="p-4"></router-view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  API_PORT,
  username,
} from './variables';

const router = useRouter();

const checkToken = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const response = await fetch(`http://localhost:${API_PORT}/api/user/validate-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        username.value = data.username;
        router.push(`/${data.username}`);
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