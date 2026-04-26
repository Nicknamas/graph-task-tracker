import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Root',
      redirect: { name: 'GraphList' },
      component: () => import('@/App.vue'),
      children: [
        {
          path: '/auth',
          name: 'AuthPage',
          component: () => import('@/pages/AuthPage.vue'),
        },
        {
          path: '/registration',
          name: 'SignUpPage',
          component: () => import('@/pages/RegistrationPage.vue'),
        },
        {
          path: '/graph',
          name: 'GraphList',
          component: () => import('@/pages/GraphListPage.vue'),
        },
        {
          path: '/graph/:graphId',
          name: 'GraphPage',
          component: () => import('@/pages/GraphPage.vue'),
        }
      ]
    },
  ],
})

export default router
