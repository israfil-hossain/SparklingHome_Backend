import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsMongoId, IsOptional } from "class-validator";
import { PaginationQuery } from "../../common/dto/pagintation-query.dto";

export class ListCleaningBookingQueryDto extends PaginationQuery {
  @ApiProperty({
    required: false,
    description: "The ID of booking user",
  })
  @IsMongoId({ message: "Invalid booking user Id" })
  @IsOptional()
  BookingUserId?: string;

  @ApiProperty({
    required: false,
    description: "Start date for filtering cleaning subscriptions.",
  })
  @IsOptional()
  @IsDateString()
  PaymentFromDate?: string;

  @ApiProperty({
    required: false,
    description: "End date for filtering cleaning subscriptions.",
  })
  @IsOptional()
  @IsDateString()
  PaymentToDate?: string;
}
