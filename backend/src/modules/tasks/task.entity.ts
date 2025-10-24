import { Column, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

@Entity('tasks')
@Index(['title'])
@Index(['description'])
@Index(['userId', 'startDate', 'endDate'])
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'enum', enum: ['todo','in_progress','done'], default: 'todo' })
  status: TaskStatus;

  @Column({ type: 'datetime' })
  startDate: Date;

  @Column({ type: 'datetime' })
  endDate: Date;

  @Column()
  userId: number;

  @ManyToOne(() => User, (u) => u.tasks, { eager: true })
  user: User;
}