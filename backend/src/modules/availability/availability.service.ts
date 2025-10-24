import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { Task } from '../tasks/task.entity';

@Injectable()
export class AvailabilityService {
  private logger = new Logger(AvailabilityService.name);
  constructor(
    @InjectRepository(Availability) private repo: Repository<Availability>,
    @InjectRepository(Task) private tasks: Repository<Task>,
  ) {}

  async recomputeForUser(userId: number) {
    await this.repo.delete({ userId });
    const rows = await this.tasks.find({ where: { userId } });
    const inserts = rows.map((t) => this.repo.create({
      userId,
      startDate: t.startDate,
      endDate: t.endDate,
    }));
    await this.repo.save(inserts);
    this.logger.log(`Availability recomputed for user ${userId}`);
  }
}