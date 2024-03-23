import { Module } from "@nestjs/common";
import { ApplicationUserModule } from "../application-user/application-user.module";
import { CleaningBookingModule } from "../cleaning-booking/cleaning-booking.module";
import { CleaningSubscriptionModule } from "../cleaning-subscription/cleaning-subscription.module";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [
    ApplicationUserModule,
    CleaningSubscriptionModule,
    CleaningBookingModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
