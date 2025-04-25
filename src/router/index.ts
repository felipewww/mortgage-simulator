import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/home/home.vue'),
    },
    {
      path: '/sac',
      name: 'sac',
      component: () => import('@/views/sac/sac.vue'),
    },
  ],
})

export default router
