import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningBookingController } from "./cleaning-booking.controller";
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
  providers: [CleaningBookingService],
})
export class CleaningBookingModule {}
