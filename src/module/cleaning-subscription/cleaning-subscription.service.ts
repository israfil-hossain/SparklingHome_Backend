import { Injectable } from "@nestjs/common";
import { CleaningSubscriptionFrequencyEnum } from "./enum/cleaning-subscription-frequency.enum";

@Injectable()
export class CleaningSubscriptionService {
  getAllCleaningSubscriptionTypes() {
    const subscriptionTypes = Object.values(
      CleaningSubscriptionFrequencyEnum,
    ).map((value) => ({
      label: value.replace(/([a-z])([A-Z])/g, "$1 $2"),
      value,
    }));

    return subscriptionTypes;
  }
}
