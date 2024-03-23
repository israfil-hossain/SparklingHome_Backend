import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  Min,
  MinDate,
} from "class-validator";
import { CleaningSubscriptionFrequencyEnum } from "../enum/cleaning-subscription-frequency.enum";

export class UpdateCleaningSubscriptionDto {
  @ApiProperty({
    required: false,
    description: "Area in square meters",
    example: 100,
  })
  @IsOptional()
  @IsNumber({}, { message: "Area must be a number" })
  @Min(1, { message: "Area must be at least 1 square meter" })
  areaInSquareMeters?: number;

  @ApiProperty({
    required: false,
    description: "Duration of cleaning in hours",
    example: 2,
  })
  @IsOptional()
  @IsNumber({}, { message: "Cleaning duration must be a number" })
  @Min(1, { message: "Cleaning duration must be at least 1 hour" })
  cleaningDurationInHours?: number;

  @ApiProperty({
    required: false,
    description: "Next schedule date of the subscription",
    example: "2024-03-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDate({ message: "Next schedule date must be a valid date" })
  @MinDate(new Date(), { message: "Next schedule date must be in the future" })
  nextScheduleDate?: Date;

  @ApiProperty({
    required: false,
    enum: CleaningSubscriptionFrequencyEnum,
    default: CleaningSubscriptionFrequencyEnum.WEEKLY,
    description: "The frequency of the cleaning subscription.",
  })
  @IsOptional()
  @IsEnum(CleaningSubscriptionFrequencyEnum, {
    message: "Invalid subscription frequency",
  })
  subscriptionFrequency?: CleaningSubscriptionFrequencyEnum;

  @ApiProperty({
    required: false,
    description: "Indicates if there are cats in the house",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "hasCats must be a boolean value" })
  hasCats?: boolean;

  @ApiProperty({
    required: false,
    description: "Indicates if there are dogs in the house",
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: "hasDogs must be a boolean value" })
  hasDogs?: boolean;

  @ApiProperty({
    required: false,
    description: "Indicates if there are other pets in the house",
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: "hasOtherPets must be a boolean value" })
  hasOtherPets?: boolean;
}
