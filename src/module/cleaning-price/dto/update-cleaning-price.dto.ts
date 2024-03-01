import { PartialType } from "@nestjs/swagger";
import { CreateCleaningPriceDto } from "./create-cleaning-price.dto";

export class UpdateCleaningPriceDto extends PartialType(
  CreateCleaningPriceDto,
) {}
