import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, Max, Min } from "class-validator";

export class SuppliesChargeDto {
  @ApiProperty({
    description: "Supplies Charge",
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  suppliesCharge: number;
}

export class UpdateSuppliesChargeDto extends PartialType(SuppliesChargeDto) {}
