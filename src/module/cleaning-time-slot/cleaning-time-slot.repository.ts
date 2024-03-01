import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { GenericRepository } from "../common/repository/generic-repository";
import {
  CleaningTimeSlot,
  CleaningTimeSlotDocument,
  CleaningTimeSlotType,
} from "./entities/cleaning-time-slot.entity";

@Injectable()
export class CleaningTimeSlotRepository extends GenericRepository<CleaningTimeSlotDocument> {
  constructor(
    @InjectModel(CleaningTimeSlot.name)
    private model: CleaningTimeSlotType,
  ) {
    super(model);
  }
}
