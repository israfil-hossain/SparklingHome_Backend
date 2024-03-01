import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningBooking,
  CleaningBookingDocument,
  CleaningBookingType,
} from "./entities/cleaning-booking.entity";

@Injectable()
export class CleaningBookingRepository extends GenericRepository<CleaningBookingDocument> {
  constructor(
    @InjectModel(CleaningBooking.name)
    private model: CleaningBookingType,
  ) {
    super(model);
  }
}
