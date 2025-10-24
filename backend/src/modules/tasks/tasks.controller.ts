import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto, UpdateTaskDto, ReassignTaskDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TaskQueryDto } from './query.dto';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasks: TasksService) {}

  @Get()
  list(@Query() q: TaskQueryDto) { return this.tasks.paginate(q); }

  @Get('search')
  search(@Query('q') q: string) { return this.tasks.search(q || ''); }

  @Post()
  create(@Body() dto: CreateTaskDto) { return this.tasks.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTaskDto) {
    return this.tasks.update(Number(id), dto);
  }

  @Patch(':id/reassign')
  reassign(@Param('id') id: string, @Body() dto: ReassignTaskDto) {
    return this.tasks.reassign(Number(id), dto.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.tasks.remove(Number(id)); }
}