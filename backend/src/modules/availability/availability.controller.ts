import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './availability.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('availability')
export class AvailabilityController {
  constructor(@InjectRepository(Availability) private repo: Repository<Availability>) {}

  @Get(':userId')
  get(@Param('userId') userId: string) {
    return this.repo.find({ where: { userId: Number(userId) }, order: { startDate: 'ASC' } });
  }
}