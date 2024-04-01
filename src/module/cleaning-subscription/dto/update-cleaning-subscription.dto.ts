import { PartialType, PickType } from "@nestjs/swagger";
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
) {}
