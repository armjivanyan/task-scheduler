<template>
  <div class="space-y-2 task-list-center">
    <div v-for="t in tasks" :key="t.id" class="card task-card" style="padding:12px">
      <div class="flex items-start gap-2">
        <div class="flex-1">
          <div class="flex justify-between">
            <strong>{{ t.title }}</strong>
            <span>Assignee: {{ t.user?.name || t.user?.email || t.userId }} • {{ t.status }}</span>
          </div>
          <small>{{ t.startDate }} → {{ t.endDate }}</small>
          <p v-if="t.description">{{ t.description }}</p>
          <div class="flex gap-2 mt-2">
            <n-button size="small" @click="$emit('edit', t)">Edit</n-button>
            <n-button size="small" type="error" ghost @click="$emit('remove', t.id)">Delete</n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { NButton } from 'naive-ui';
withDefaults(defineProps<{ tasks: any[]; selected: Set<number> }>(), { tasks: () => [], selected: () => new Set() });
</script>

<style scoped>
  .task-list-center {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .task-card {
    width: 100%;
    max-width: 600px;
    margin: 0.5rem auto;
    box-sizing: border-box;
  }
  .flex.justify-between {
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  @media (max-width: 600px) {
    .task-card {
      max-width: 98vw;
      padding: 8px 4px !important;
    }
    .flex.justify-between {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
    }
    .flex.gap-2.mt-2 {
      flex-direction: column;
      gap: 0.25rem;
      width: 100%;
    }
  }
</style>