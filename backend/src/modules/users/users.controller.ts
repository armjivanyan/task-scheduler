import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  @Get()
  list() {
    return this.repo.find({ select: { id: true, name: true, email: true } });
  }
}