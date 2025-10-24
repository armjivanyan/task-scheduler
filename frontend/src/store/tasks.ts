import { defineStore } from 'pinia';
import { paginateTasks, updateTask, createTask, deleteTask } from '../api/tasks';
import type { SortBy, SortDir } from '../api/tasks';
import { listUsers } from '../api/users';

export const useTasks = defineStore('tasks', {
  state: () => ({
    items: [] as any[], total: 0, page: 1, limit: 20,
    params: { q: '', status: undefined as string | undefined, userId: undefined as number | undefined, sortBy: 'startDate' as SortBy, sortDir: 'ASC' as SortDir },
    selected: new Set<number>(), users: [] as any[]
  }),
  actions: {
    async remove(id: number) {
      await deleteTask(id);
      await this.fetchPage(this.page);
    },
    async add(payload: any) {
      const task = await createTask(payload);
      await this.fetchPage(this.page);
      return task;
    },

    async patch(id: number, payload: any) {
      const task = await updateTask(id, payload);
      await this.fetchPage(this.page);
      return task;
    },
    async fetchUsers() { this.users = await listUsers(); },
    async fetchPage(page = 1) {
      this.page = page;
      const data = await paginateTasks({ page, limit: this.limit, ...this.params });
      this.items = data.items; this.total = data.total; this.params.sortBy = data.sortBy; this.params.sortDir = (data.sortDir?.toUpperCase?.() || 'ASC') as SortDir;
    },
    setSort(sortBy: SortBy, sortDir: SortDir) { this.params.sortBy = sortBy; this.params.sortDir = sortDir; return this.fetchPage(1); },
    setFilters({ q, status, userId }: any) { this.params.q = q ?? ''; this.params.status = status || undefined; this.params.userId = userId ? Number(userId) : undefined; return this.fetchPage(1); },
    toggleSelect(id: number) { this.selected.has(id) ? this.selected.delete(id) : this.selected.add(id); },
    clearSelection() { this.selected.clear(); },
    async quickStatus(id: number, status: string) { await updateTask(id, { status: status as import('../api/tasks').TaskStatus }); await this.fetchPage(this.page); },
    handleEvent(e: any) {
      switch (e.type) {
        case 'created':
        case 'updated':
        case 'reassigned':
          if (e.task) this.upsert(e.task);
          break;
        case 'deleted':
          if (e.taskId) this.items = this.items.filter((t:any) => t.id !== e.taskId);
          break;
      }
    },
    upsert(t: any) { const i = this.items.findIndex((x:any) => x.id === t.id); if (i >= 0) this.items[i] = t; else this.items.unshift(t); },
  }
});