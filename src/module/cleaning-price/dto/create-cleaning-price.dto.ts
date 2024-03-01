import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, Min } from "class-validator";
import { CleaningSubscriptionFrequencyEnum } from "../../cleaning-subscription/enum/cleaning-subscription-frequency.enum";

export class CreateCleaningPriceDto {
  @ApiProperty({
    enum: CleaningSubscriptionFrequencyEnum,
    default: CleaningSubscriptionFrequencyEnum.WEEKLY,
    description: "The frequency of the cleaning subscription.",
  })
  @IsNotEmpty({ message: "Subscription frequency is required" })
  @IsEnum(CleaningSubscriptionFrequencyEnum, {
    message: "Invalid subscription frequency",
  })
  subscriptionFrequency: CleaningSubscriptionFrequencyEnum;

  @ApiProperty({
    type: Number,
    description: "The price of the cleaning subscription.",
  })
  @IsNotEmpty({ message: "Subscription price is required" })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: "Subscription price must be a number" },
  )
  @Min(1, { message: "Subscription price must be greater than 0" })
  subscriptionPrice: number;

  @ApiProperty({
    type: String,
    required: false,
    description: "Optional description for the cleaning subscription.",
  })
  @IsOptional()
  description?: string;
}
