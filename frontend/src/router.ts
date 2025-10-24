import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './views/LoginView.vue';
import TaskBoard from './views/TaskBoard.vue';
import { useAuth } from './store/auth';

const routes = [
  { path: '/login', component: LoginView },
  { path: '/', component: TaskBoard, meta: { requiresAuth: true } },
];

const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach((to) => {
  const token = localStorage.getItem('token');
  if (to.meta.requiresAuth && !token) return '/login';
});

export default router;