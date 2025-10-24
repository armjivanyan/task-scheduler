import { OnEvent } from '@nestjs/event-emitter';
import { Injectable } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Injectable()
export class AvailabilityListener {
  constructor(private avail: AvailabilityService) {}

  @OnEvent('availability.updated', { async: true })
  handleAvailabilityUpdate(payload: { userId: number }) {
    return this.avail.recomputeForUser(payload.userId);
  }
}