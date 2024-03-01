import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CleaningBookingService } from "./cleaning-booking.service";

@ApiTags("Cleaning Bookings")
@Controller("CleaningBooking")
export class CleaningBookingController {
  constructor(
    private readonly cleaningBookingService: CleaningBookingService,
  ) {}

  @Get("GetAll")
  findAll() {
    return this.cleaningBookingService.findAll();
  }
}
