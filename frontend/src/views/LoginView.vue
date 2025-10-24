<template>
  <div class="min-h-screen flex items-center justify-center login-bg">
    <n-card class="login-card" title="Login">
      <n-form @submit.prevent="submit">
        <n-form-item label="Email">
          <n-input
            v-model:value="email"
            type="text"
            inputmode="email"
            autocomplete="email"
            placeholder="Email"
          />
        </n-form-item>
        <n-form-item label="Password">
          <n-input v-model:value="password" type="password" placeholder="Password" />
        </n-form-item>
        <n-alert v-if="error" type="error" :show-icon="false" style="margin-bottom:8px">{{ error }}</n-alert>
        <n-button type="primary" attr-type="submit" :loading="busy" block>Sign in</n-button>
      </n-form>
    </n-card>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import { NCard, NForm, NFormItem, NInput, NButton, NAlert } from 'naive-ui';
const email = ref('admin@example.com');
const password = ref('Admin123!');
const error = ref('');
const busy = ref(false);
const auth = useAuth();
const router = useRouter();
async function submit() {
  try { 
    busy.value = true; error.value = ''; 
    await auth.doLogin(email.value, password.value); router.push('/'); 
  }
  catch (e:any) { 
    error.value = e?.response?.data?.message || 'Login failed'; 
  }
  finally { busy.value = false; }
}
</script>

<style scoped>
  .login-bg {
    background: #f8f9fb;
  }
  .login-card {
    width: 100%;
    max-width: 360px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    box-sizing: border-box;
  }
  @media (max-width: 480px) {
    .login-card {
      padding: 1rem 0.5rem;
      max-width: 98vw;
    }
  }
</style>