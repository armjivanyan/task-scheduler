<template>
  <div class="taskboard-outer">
    <div class="taskboard-inner">
      <header class="flex gap-2 items-center justify-center">
        <n-input v-model:value="q" placeholder="Search tasks" @keyup.enter="applyFilters" style="max-width:220px" />
        <n-select v-model:value="status" :options="statusOptions" placeholder="Status" style="width:160px" />
        <n-select v-model:value="assignee" :options="userOptions" placeholder="Assignee" style="width:200px" />
        <n-select v-model:value="sortBy" :options="sortByOptions" style="width:160px" />
        <n-select v-model:value="sortDir" :options="sortDirOptions" style="width:120px" />
        <n-button type="primary" @click="openModal()">New Task</n-button>
        <n-button @click="applyFilters">Apply</n-button>
      </header>

      <TaskList :tasks="store.items" :selected="store.selected" @toggle="store.toggleSelect" @edit="openModal" @remove="remove" />

      <footer class="flex items-center gap-8 justify-center" style="margin-top:8px">
        <n-button :disabled="store.page<=1" @click="store.fetchPage(store.page-1)">Prev</n-button>
        <span>Page {{ store.page }} • Total {{ store.total }}</span>
        <n-button :disabled="store.page*store.limit >= store.total" @click="store.fetchPage(store.page+1)">Next</n-button>
      </footer>

      <TaskModal v-if="show" :initial="editing" @close="closeModal" @saved="onSaved" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useTasks } from '../store/tasks';
import TaskList from '../components/TaskList.vue';
import TaskModal from '../components/TaskModal.vue';
import { useNotify } from '../lib/notify';
import { useRoute, useRouter } from 'vue-router';
import { NInput, NSelect, NButton, NAlert } from 'naive-ui';

const { success, error } = useNotify();
const store = useTasks();
const route = useRoute();
const router = useRouter();

const q = ref('');
const status = ref<string | undefined>(undefined);
const assignee = ref<number | undefined>(undefined);
const sortBy = ref('startDate');
const sortDir = ref('ASC');
const bulkUser = ref<number | undefined>(undefined);

const statusOptions = [
  { label: 'All', value: undefined },
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];
const sortByOptions = [
  { label: 'Start', value: 'startDate' },
  { label: 'End', value: 'endDate' },
  { label: 'Title', value: 'title' },
  { label: 'Status', value: 'status' },
  { label: 'Assignee', value: 'userId' },
  { label: 'ID', value: 'id' },
];
const sortDirOptions = [
  { label: 'ASC', value: 'ASC' },
  { label: 'DESC', value: 'DESC' },
];
const userOptions = computed(() => (store.users || []).map(u => ({ label: u.name, value: u.id })));

const show = ref(false);
const editing = ref<any>(null);
const busy = ref(false);

onMounted(async () => {
  q.value = (route.query.q as string) || '';
  status.value = (route.query.status as string) || undefined;
  assignee.value = route.query.userId ? Number(route.query.userId) : undefined;
  sortBy.value = (route.query.sortBy as any) || sortBy.value;
  sortDir.value = (route.query.sortDir as any) || sortDir.value;

  await store.fetchUsers();
  await store.fetchPage(Number(route.query.page) || 1);
});

function pushQuery() {
  router.replace({ query: {
    q: q.value || undefined,
    status: status.value || undefined,
    userId: assignee.value || undefined,
    sortBy: sortBy.value,
    sortDir: sortDir.value,
    page: store.page,
  }});
}

function applyFilters() { store.setFilters({ q: q.value, status: status.value || undefined, userId: assignee.value }); pushQuery(); }
watch(() => store.page, pushQuery);

function openModal(task?: any) { editing.value = task || null; show.value = true; }
function closeModal() { show.value = false; }
function onSaved() { show.value = false; store.fetchPage(store.page); }
async function remove(id: number) { try { await store.remove?.(id); success('Task deleted'); store.fetchPage(store.page); } catch { error('Delete failed'); } }
</script>

<style scoped>
  .taskboard-outer {
    min-height: 95vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8f9fb;
  }
  .taskboard-inner {
    width: 100vw;
    max-width: 900px;
    padding: 2rem 1rem;
    margin: 0 auto;
    border-radius: 16px;
    box-sizing: border-box;
  }
  @media (max-width: 600px) {
    .taskboard-inner {
      max-width: 100vw;
      padding: 0.5rem 0.25rem;
      border-radius: 0;
    }
    .taskboard-outer {
      align-items: flex-start;
      padding-top: 1rem;
    }
    header.flex.gap-2.items-center.justify-center {
      flex-direction: column;
      align-items: stretch;
      gap: 0.5rem;
    }
    footer.flex.items-center.gap-8.justify-center {
      flex-direction: column;
      gap: 0.5rem;
    }
  }
</style>