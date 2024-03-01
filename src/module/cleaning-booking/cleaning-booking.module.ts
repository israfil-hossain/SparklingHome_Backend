import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningBookingController } from "./cleaning-booking.controller";
import { CleaningBookingRepository } from "./cleaning-booking.repository";
import { CleaningBookingService } from "./cleaning-booking.service";
import {
  CleaningBooking,
  CleaningBookingSchema,
} from "./entities/cleaning-booking.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CleaningBooking.name, schema: CleaningBookingSchema },
    ]),
  ],
  controllers: [CleaningBookingController],
  providers: [CleaningBookingService, CleaningBookingRepository],
  exports: [CleaningBookingRepository],
})
export class CleaningBookingModule {}
