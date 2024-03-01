import { Module } from "@nestjs/common";
import { CleaningBookingController } from "./cleaning-booking.controller";
import { CleaningBookingService } from "./cleaning-booking.service";

@Module({
  controllers: [CleaningBookingController],
  providers: [CleaningBookingService],
})
export class CleaningBookingModule {}
