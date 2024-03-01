import { PartialType } from "@nestjs/swagger";
import { CreateCleaningTimeSlotDto } from "./create-cleaning-time-slot.dto";

export class UpdateCleaningTimeSlotDto extends PartialType(
  CreateCleaningTimeSlotDto,
) {}
