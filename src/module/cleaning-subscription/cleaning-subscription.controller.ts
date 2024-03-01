import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";

@ApiTags("Cleaning Subscription")
@Controller("CleaningSubscription")
export class CleaningSubscriptionController {
  constructor(
    private readonly subscriptionService: CleaningSubscriptionService,
  ) {}

  @Get("GetAllSubscriptionTypes")
  getAllCleaningSubscriptionTypes() {
    return this.subscriptionService.getAllCleaningSubscriptionTypes();
  }
}
