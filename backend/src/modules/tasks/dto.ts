import { IsDateString, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator';
import { TaskStatus } from './task.entity';

export class CreateTaskDto {
  @IsString() @MinLength(2) title: string;
  @IsOptional() @IsString() description?: string;
  @IsEnum(['todo','in_progress','done']) status: TaskStatus;
  @IsDateString() startDate: string;
  @IsDateString() endDate: string;
  @IsInt() userId: number;
}

export class UpdateTaskDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsEnum(['todo','in_progress','done']) status?: TaskStatus;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;
  @IsOptional() @IsInt() userId?: number;
}

export class ReassignTaskDto {
  @IsInt() userId: number;
}