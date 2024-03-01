import { PartialType } from "@nestjs/swagger";
import { CreateCleaningSubscriptionDto } from "./create-cleaning-subscription.dto";

export class UpdateCleaningSubscriptionDto extends PartialType(
  CreateCleaningSubscriptionDto,
) {}
