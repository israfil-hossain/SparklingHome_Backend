import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningTimeSlotController } from "./cleaning-time-slot.controller";
import { CleaningTimeSlotRepository } from "./cleaning-time-slot.repository";
import { CleaningTimeSlotService } from "./cleaning-time-slot.service";
import {
  CleaningTimeSlot,
  CleaningTimeSlotSchema,
} from "./entities/cleaning-time-slot.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CleaningTimeSlot.name, schema: CleaningTimeSlotSchema },
    ]),
  ],
  controllers: [CleaningTimeSlotController],
  providers: [CleaningTimeSlotService, CleaningTimeSlotRepository],
})
export class CleaningTimeSlotModule {}
