import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString, Max, Min } from "class-validator";

export class CreateCleaningCouponDto {
  @ApiProperty({ description: "The coupon code", example: "CLEAN25" })
  @IsNotEmpty({ message: "Coupon code must not be empty" })
  @IsString({ message: "Coupon code must be a string" })
  couponCode: string;

  @ApiProperty({ description: "The discount percentage", example: 25 })
  @IsInt({ message: "Discount percentage must be an integer" })
  @Min(1, { message: "Discount percentage must be at least 1" })
  @Max(100, { message: "Discount percentage must be at most 100" })
  discountPercentage: number;

  @ApiProperty({ description: "The maximum discount amount", example: 50 })
  @IsInt({ message: "Maximum discount must be an integer" })
  @Min(1, { message: "Maximum discount must be at least 1" })
  maximumDiscount: number;
}
