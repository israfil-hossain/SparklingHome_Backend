import { ApiProperty, PartialType, PickType } from "@nestjs/swagger";
import { IsDate, IsOptional, MinDate } from "class-validator";
import { CreateCleaningSubscriptionDto } from "./create-cleaning-subscription.dto";

export class UpdateCleaningSubscriptionDto extends PartialType(
  PickType(CreateCleaningSubscriptionDto, [
    "areaInSquareMeters",
    "cleaningDurationInHours",
    "subscriptionFrequency",
    "hasCats",
    "hasDogs",
    "hasOtherPets",
  ]),
) {
  @ApiProperty({
    required: false,
    description: "Next schedule date of the subscription",
  })
  @IsOptional()
  @IsDate({ message: "Next schedule date must be a valid date" })
  @MinDate(new Date(), { message: "Next schedule date must be in the future" })
  nextScheduleDate?: Date;
}
