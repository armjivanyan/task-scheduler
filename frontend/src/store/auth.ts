import { defineStore } from 'pinia';
import { login } from '../api/tasks';

interface UserPayload { sub: number; email: string; name: string; }

export const useAuth = defineStore('auth', {
  state: () => ({ token: localStorage.getItem('token') || '', user: null as UserPayload | null }),
  actions: {
    async doLogin(email: string, password: string) {
      const data = await login(email, password);
      this.token = data.accessToken;
      this.user = data.user;
      localStorage.setItem('token', this.token);
      window.location.href = '/';
    },
    logout() {
      this.token = ''; this.user = null; localStorage.removeItem('token');
    }
  },
  getters: {
    isAuthed: (state): boolean => !!state.token
  }
});