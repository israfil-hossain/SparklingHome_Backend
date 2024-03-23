import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";
import { CreateCleaningPriceDto } from "./create-cleaning-price.dto";

export class UpdateCleaningPriceDto extends PartialType(
  CreateCleaningPriceDto,
) {
  @ApiProperty({
    required: false,
    description: "Specify if enitiy is active or not",
  })
  @IsOptional()
  @IsBoolean({ message: "Must be a boolean" })
  isActive?: boolean;
}
