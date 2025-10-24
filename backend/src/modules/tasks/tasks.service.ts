import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Task } from './task.entity';
import { CreateTaskDto, UpdateTaskDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private repo: Repository<Task>,
    private events: EventEmitter2,
  ) {}

  async paginate(params: { page?: number; limit?: number; q?: string; status?: string; userId?: number; sortBy?: string; sortDir?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const allowedSort = ['startDate','endDate','title','status','userId','id'] as const;
    type SortKey = typeof allowedSort[number];

    const sortBy: SortKey = allowedSort.includes((params.sortBy as any)) ? (params.sortBy as SortKey) : 'startDate';
    const sortDir: 'ASC' | 'DESC' = (params.sortDir?.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

    const sortKey = String(sortBy); // <- normalize to string
    const qb = this.repo.createQueryBuilder('t')
      .leftJoinAndSelect('t.user', 'user')
      .orderBy(`t.${sortKey}`, sortDir);

    if (params.q) qb.andWhere('(t.title LIKE :q OR t.description LIKE :q)', { q: `%${params.q}%` });
    if (params.status) qb.andWhere('t.status = :status', { status: params.status });
    if (params.userId) qb.andWhere('t.userId = :userId', { userId: params.userId });

    const [items, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    const nextCallUrl = total > page * limit ? `/api/tasks?page=${page+1}&limit=${limit}` : null;
    return { items, total, page, limit, sortBy, sortDir, nextCallUrl };
  }

  async search(q: string) {
    return this.repo.createQueryBuilder('task')
      .leftJoinAndSelect('task.user', 'user')
      .where('task.title LIKE :q OR task.description LIKE :q', { q: `%${q}%` })
      .orderBy('task.startDate', 'ASC')
      .getMany();
  }

  private async assertNoOverlap(userId: number, start: Date, end: Date, ignoreTaskId?: number) {
    if (end <= start) throw new BadRequestException('endDate must be after startDate');

    const qb = this.repo.createQueryBuilder('t')
      .where('t.userId = :userId', { userId })
      .andWhere(':start < t.endDate AND :end > t.startDate', { start, end });

    if (ignoreTaskId) qb.andWhere('t.id != :id', { id: ignoreTaskId });

    const overlap = await qb.getOne();
    if (overlap) throw new BadRequestException('User is not available for this time range');
  }

  async create(dto: CreateTaskDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    await this.assertNoOverlap(dto.userId, start, end);
    const task = this.repo.create({ ...dto, startDate: start, endDate: end });
    const saved = await this.repo.save(task);
    const withUser = await this.repo.findOne({ where: { id: saved.id }, relations: ['user'] });
    this.events.emit('availability.updated', { userId: saved.userId });
    this.events.emit('task.changed', { type: 'created', task: withUser });
    return withUser;
  }

  async update(id: number, dto: UpdateTaskDto) {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    const start = dto.startDate ? new Date(dto.startDate) : task.startDate;
    const end = dto.endDate ? new Date(dto.endDate) : task.endDate;
    const userId = dto.userId ?? task.userId;

    await this.assertNoOverlap(userId, start, end, id);
    Object.assign(task, { ...dto, startDate: start, endDate: end, userId });
    await this.repo.save(task);

    const withUser = await this.repo.findOne({ where: { id: task.id }, relations: ['user'] });
    this.events.emit('availability.updated', { userId });
    this.events.emit('task.changed', { type: 'updated', task: withUser });
    return withUser;
  }

  async reassign(id: number, userId: number) {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');

    await this.assertNoOverlap(userId, task.startDate, task.endDate, id);
    task.userId = userId;
    await this.repo.save(task);

    const withUser = await this.repo.findOne({ where: { id: task.id }, relations: ['user'] });
    this.events.emit('availability.updated', { userId });
    this.events.emit('task.changed', { type: 'reassigned', task: withUser });
    return withUser;
  }

  async remove(id: number) {
    const task = await this.repo.findOne({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    await this.repo.remove(task);
    this.events.emit('availability.updated', { userId: task.userId });
    this.events.emit('task.changed', { type: 'deleted', taskId: id });
    return { ok: true };
  }
}