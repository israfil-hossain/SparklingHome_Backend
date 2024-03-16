import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsString } from "class-validator";

export class VerifyCleaningCouponDto {
  @ApiProperty({
    description: "Coupon code",
    required: true,
  })
  @Type(() => String)
  @IsString()
  public readonly couponCode: string;
}
