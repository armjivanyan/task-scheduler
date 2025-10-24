import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Availability } from './availability.entity';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Task } from '../tasks/task.entity';
import { AvailabilityListener } from './availability.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Availability, Task])],
  providers: [AvailabilityService, AvailabilityListener],
  controllers: [AvailabilityController],
})
export class AvailabilityModule {}