import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import './global.css';

const pinia = createPinia();
// Pinia plugin to hydrate auth store from localStorage
pinia.use(({ store }) => {
	if (store.$id === 'auth') {
		const token = localStorage.getItem('token');
		if (token) store.token = token;
	}
});

createApp(App).use(pinia).use(router).mount('#app');