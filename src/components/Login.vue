<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-2xl font-bold mb-4 text-zinc-200">Login</h1>
    <form @submit.prevent="login" class="flex flex-col items-center">
      <div class="mb-4">
        <label class="block text-zinc-400">Username</label>
        <input v-model="formUsername" type="text" class="button" required />
      </div>
      <div class="mb-4">
        <label class="block text-zinc-400">Password</label>
        <input v-model="formPassword" type="password" class="button" required />
      </div>
      <button type="submit" class="button">Login</button>
      <p class="mt-4  text-zinc-400">
        Don't have an account? 
        <button type="button" class="button" @click="router.push('/Signup')">Signup</button>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { username } from '../variables';
import api from '../api/client';

const router = useRouter();
const formUsername = ref('');
const formPassword = ref('');

const login = async () => {
  try {
    const response = await api.post('/api/user/login', 
      new URLSearchParams({
        username: formUsername.value,
        password: formPassword.value
      })
    );

    if (response.status === 200) {
      localStorage.setItem('token', response.data.token);
      username.value = response.data.username;
      router.push('/');
    } else {
      alert('Login failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>
