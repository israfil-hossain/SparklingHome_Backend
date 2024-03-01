import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CleaningSubscriptionController } from "./cleaning-subscription.controller";
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
  providers: [CleaningSubscriptionService],
})
export class CleaningSubscriptionModule {}
