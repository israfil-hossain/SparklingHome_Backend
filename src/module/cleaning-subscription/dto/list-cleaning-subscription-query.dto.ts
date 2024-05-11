import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsDateString, IsEnum, IsOptional } from "class-validator";
import { PaginationQuery } from "../../common/dto/pagintation-query.dto";
import { CleaningSubscriptionFrequencyEnum } from "../enum/cleaning-subscription-frequency.enum";

export class ListCleaningSubscriptionQueryDto extends PaginationQuery {
  @ApiProperty({
    required: false,
    enum: CleaningSubscriptionFrequencyEnum,
    description: "The frequency of the cleaning subscription.",
  })
  @IsEnum(CleaningSubscriptionFrequencyEnum, {
    message: "Invalid subscription frequency",
  })
  @IsOptional()
  Frequency?: CleaningSubscriptionFrequencyEnum;

  @ApiProperty({
    required: false,
    type: Boolean,
    description: "Only show cancelled cleaning subscriptions.",
  })
  @IsOptional()
  @IsBoolean({ message: "Must be a boolean" })
  @Transform(({ obj, key }) => {
    return obj[key] === "true" ? true : obj[key] === "false" ? false : obj[key];
  })
  OnlyInactive?: boolean;

  @ApiProperty({
    required: false,
    type: Boolean,
    description: "Order by next schedule date for cleaning subscriptions.",
  })
  @IsOptional()
  @IsBoolean({ message: "Must be a boolean" })
  @Transform(({ obj, key }) => {
    return obj[key] === "true" ? true : obj[key] === "false" ? false : obj[key];
  })
  OrderByNextScheduleDate?: boolean;

  @ApiProperty({
    required: false,
    description: "Start date for filtering cleaning subscriptions.",
  })
  @IsOptional()
  @IsDateString()
  FromDate?: string;

  @ApiProperty({
    required: false,
    description: "End date for filtering cleaning subscriptions.",
  })
  @IsOptional()
  @IsDateString()
  ToDate?: string;

  @ApiProperty({
    required: false,
    description:
      "Start date for filtering cleaning subscriptions by next schedule date.",
  })
  @IsOptional()
  @IsDateString()
  ScheduleFromDate?: string;

  @ApiProperty({
    required: false,
    description:
      "End date for filtering cleaning subscriptions by next schedule date.",
  })
  @IsOptional()
  @IsDateString()
  ScheduleToDate?: string;
}
