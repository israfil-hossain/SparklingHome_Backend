import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationQuery } from "../../common/dto/pagintation-query.dto";

export class ListCleaningCouponQueryDto extends PaginationQuery {
  @ApiProperty({
    description: "Coupon code",
    required: false,
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  public readonly CouponCode?: string;
}
