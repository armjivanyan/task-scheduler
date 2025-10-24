<template>
  <div class="modal">
    <n-spin :show="saving">
      <n-card style="width: 30rem">
        <template #header>{{ initial ? 'Edit Task' : 'New Task' }}</template>

        <n-form @submit.prevent="save">
          <n-form-item label="Title"><n-input v-model:value="form.title" placeholder="Title" /></n-form-item>
          <n-form-item label="Description"><n-input v-model:value="form.description" type="textarea" placeholder="Description" /></n-form-item>
          <n-form-item label="Status">
            <n-select v-model:value="form.status" :options="statusOptions" />
          </n-form-item>
          <n-form-item label="Start">
            <n-date-picker
              v-model:value="form.startDate"
              type="datetime"
              style="width: 100%;"
              clearable
            />
          </n-form-item>
          <n-form-item label="End">
            <n-date-picker
              v-model:value="form.endDate"
              type="datetime"
              style="width: 100%;"
              clearable
            />
          </n-form-item>
          <n-form-item label="Assignee">
            <n-select v-model:value="form.userId" :options="userOptions" />
          </n-form-item>
          <n-alert v-if="error" type="error" :show-icon="false">{{ error }}</n-alert>

          <div class="flex gap-2 justify-end">
            <n-button @click="$emit('close')">Cancel</n-button>
            <n-button type="primary" attr-type="submit">Save</n-button>
          </div>
        </n-form>

        <div v-if="availability.length" class="mt-2">
          <small>Unavailable windows:</small>
          <ul>
            <li v-for="(a,i) in availability" :key="i">
              {{ new Date(a.startDate).toLocaleString() }} → {{ new Date(a.endDate).toLocaleString() }}
            </li>
          </ul>
        </div>
      </n-card>
    </n-spin>
  </div>
</template>
<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue';
import { useTasks } from '../store/tasks';
import { getAvailability, TaskStatus } from '../api/tasks';
import { useNotify } from '../lib/notify';
import { NCard, NForm, NFormItem, NInput, NButton, NSelect, NAlert, NSpin, NDatePicker } from 'naive-ui';

const props = defineProps<{ initial?: any }>();
const emit = defineEmits(['saved','close']);
const store = useTasks();
const { success, error: toastError } = useNotify();

const error = ref('');
const saving = ref(false);

const statusOptions: { label: string; value: TaskStatus }[] = [
  { label: 'Todo', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Done', value: 'done' },
];
const userOptions = computed(() => (store.users || []).map(u => ({ label: u.name, value: u.id })));

const form = reactive<{
  title: string;
  description: string;
  status: TaskStatus;
  startDate: number | null;
  endDate: number | null;
  userId: number;
}>({
  title: '',
  description: '',
  status: 'todo',
  startDate: null,
  endDate: null,
  userId: 1,
});

watch(() => props.initial, (v) => {
  if (!v) { 
    Object.assign(form, {
      title: '',
      description: '',
      status: 'todo',
      startDate: null,
      endDate: null,
      userId: 1
    }); 
    return;
  }
  Object.assign(form, {
    title: v.title,
    description: v.description || '',
    status: v.status,
    startDate: v.startDate ? new Date(v.startDate).getTime() : null,
    endDate: v.endDate ? new Date(v.endDate).getTime() : null,
    userId: v.userId
  });
}, { immediate: true });

const availability = ref<{startDate:string; endDate:string}[]>([]);
watch(() => form.userId, async (u) => {
  if (!u) return; availability.value = await getAvailability(Number(u));
}, { immediate: true });

function isOverlap(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date, exclude?: { start: number, end: number }) {
  if (exclude && bStart.getTime() === exclude.start && bEnd.getTime() === exclude.end) return false;
  return aStart < bEnd && aEnd > bStart;
}

async function save() {
  try {
    saving.value = true;
    error.value = '';
    const start = form.startDate ? new Date(form.startDate) : null;
    const end = form.endDate ? new Date(form.endDate) : null;
    if (!start || !end || end <= start) {
      error.value = 'Invalid date range'; return;
    }
    let exclude: { start: number, end: number } | undefined = undefined;
    if (props.initial?.startDate && props.initial?.endDate) {
      exclude = {
        start: new Date(props.initial.startDate).getTime(),
        end: new Date(props.initial.endDate).getTime(),
      };
    }
    const conflict = availability.value.some((a: { startDate: string; endDate: string }) =>
      isOverlap(start, end, new Date(a.startDate), new Date(a.endDate), exclude)
    );
    if (conflict) { error.value = 'User is not available for this time range'; return; }

    const payload = {
      title: form.title,
      description: form.description || undefined,
      status: form.status,
      startDate: start.toISOString(),
      endDate: end.toISOString(),
      userId: Number(form.userId),
    };
    if (props.initial?.id) await store.patch(props.initial.id, payload);
    else await store.add(payload as any);
    success('Task saved');
    emit('saved');
  } catch (e:any) {
    error.value = e?.response?.data?.message || 'Failed to save task';
    toastError(error.value);
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
  .modal {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    overflow-y: auto;
  }

  .n-card {
    max-width: 480px;
    width: 100%;
    margin: 0 auto;
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-sizing: border-box;
    max-height: 98dvh;
    overflow-y: auto;
  }
  .n-form {
    width: 100%;
  }
  .flex.justify-end {
    justify-content: flex-end;
  }
  @media (max-width: 600px) {
    .n-card {
      max-width: 98vw;
      padding: 1rem 0.5rem;
      border-radius: 8px;
    }
    .modal {
      align-items: flex-start;
      padding-top: 2rem;
    }
  }
</style>