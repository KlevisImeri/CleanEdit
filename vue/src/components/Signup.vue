<template>
  <div class="flex flex-col items-center justify-center min-h-screen">
    <h1 class="text-2xl font-bold mb-4">Signup</h1>
    <form @submit.prevent="signup" class="flex flex-col items-center">
      <div class="mb-4">
        <label class="block text-zinc-400">Username</label>
        <input v-model="username" type="text" class="button" required />
      </div>
      <div class="mb-4">
        <label class="block text-zinc-400">Password</label>
        <input v-model="password" type="password" class="button" required />
      </div>
      <div class="mb-4">
        <label class="block text-zinc-400">Email</label>
        <input v-model="email" type="email" class="button" required />
      </div>
      <button type="submit" class="button">Signup</button>
      <button type="button" class="button mt-4" @click="$emit('back-to-login')">Back to Login</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { API_PORT } from '../variables';

const router = useRouter();
const username = ref('');
const password = ref('');
const email = ref('');

const signup = async () => {
  try {
    const response = await fetch(`http://localhost:${API_PORT}/api/user/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        username: username.value,
        password: password.value,
        email: email.value
      })
    });

    if (response.ok) {
      alert('Signup successful');
      router.push('/login');
    } else {
      alert('Signup failed');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
</script>