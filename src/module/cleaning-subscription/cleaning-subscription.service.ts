import { Injectable } from "@nestjs/common";
import { CleaningSubscriptionFrequencyEnum } from "./enum/cleaning-subscription-frequency.enum";

@Injectable()
export class CleaningSubscriptionService {
  getAllCleaningSubscriptionTypes() {
    const subscriptionTypes = Object.values(
      CleaningSubscriptionFrequencyEnum,
    ).map((value) => ({
      label: value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase()),
      value,
    }));

    return subscriptionTypes;
  }
}
