import { ApiProperty, PartialType } from "@nestjs/swagger";
import { IsBoolean } from "class-validator";
import { CreateCleaningCouponDto } from "./create-cleaning-coupon.dto";

export class UpdateCleaningCouponDto extends PartialType(
  CreateCleaningCouponDto,
) {
  @ApiProperty({
    description: "Indicates whether the coupon is active or not",
    example: true,
  })
  @IsBoolean({ message: "Must be a boolean" })
  isActive: boolean;
}
