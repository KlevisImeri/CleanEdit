import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'
import Home from '@/components/Home.vue'
import Login from '@/components/Login.vue'
import Signup from '@/components/Signup.vue'
import Project from '@/components/Project.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'App',
      component: App
    },
    {
      path: '/:username',
      name: 'Home',
      component: Home
    },
    {
      path: '/:username/:projectName',
      name: 'Project',
      component: Project
    },
    {
      path: '/login',
      name: 'Login',
      component: Login
    },
    {
      path: '/signup',
      name: 'Signup',
      component: Signup
    }
  ]
})

export default router