import http from './http';
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type SortBy = 'startDate' | 'endDate' | 'title' | 'status' | 'userId' | 'id';
export type SortDir = 'ASC' | 'DESC';
export interface TaskDTO {
  id: number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  startDate: string;
  endDate: string;
  userId: number;
  user?: { id: number; name?: string; email: string };
}

export function login(email: string, password: string) {
  return http.post('/auth/login', { email, password }).then(r => r.data);
}

export function paginateTasks(params: { page?: number; limit?: number; q?: string; status?: string; userId?: number; sortBy?: SortBy; sortDir?: SortDir }) {
  const filtered: any = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') filtered[k] = v;
  });
  return http.get('/tasks', { params: filtered }).then(r => r.data);
}

export function listTasks() {
  return http.get<TaskDTO[]>('/tasks').then(r => r.data);
}

export function searchTasks(q: string) {
  return http.get<TaskDTO[]>('/tasks/search', { params: { q } }).then(r => r.data);
}

export function createTask(payload: Omit<TaskDTO, 'id'>) {
  return http.post<TaskDTO>('/tasks', payload).then(r => r.data);
}

export function updateTask(id: number, payload: Partial<Omit<TaskDTO, 'id'>>) {
  return http.patch<TaskDTO>(`/tasks/${id}`, payload).then(r => r.data);
}

export function reassignTask(id: number, userId: number) {
  return http.patch<TaskDTO>(`/tasks/${id}/reassign`, { userId }).then(r => r.data);
}

export function deleteTask(id: number) {
  return http.delete(`/tasks/${id}`).then(r => r.data);
}

export function getAvailability(userId: number) {
  return http.get(`/availability/${userId}`).then(r => r.data);
}