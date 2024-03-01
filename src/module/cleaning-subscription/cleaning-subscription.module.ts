import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningSubscriptionController } from "./cleaning-subscription.controller";
import { CleaningSubscriptionRepository } from "./cleaning-subscription.repository";
import { CleaningSubscriptionService } from "./cleaning-subscription.service";
import {
  CleaningSubscription,
  CleaningSubscriptionSchema,
} from "./entities/cleaning-subscription.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CleaningSubscription.name, schema: CleaningSubscriptionSchema },
    ]),
  ],
  controllers: [CleaningSubscriptionController],
  providers: [CleaningSubscriptionService, CleaningSubscriptionRepository],
})
export class CleaningSubscriptionModule {}
