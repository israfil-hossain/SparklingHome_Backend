import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsNumber, Max, Min } from "class-validator";

export class CommissionSettingsDto {
  @ApiProperty({
    description: "Owner's Commission",
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  ownerCommission: number;

  @ApiProperty({
    description: "Renter's Commission",
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  renterCommission: number;
}

export class UpdateCommissionSettingsDto extends PartialType(
  CommissionSettingsDto,
) {}
