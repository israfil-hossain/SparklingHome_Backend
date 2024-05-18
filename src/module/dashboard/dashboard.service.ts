import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ApplicationUserRepository } from "../application-user/application-user.repository";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { CleaningBookingRepository } from "../cleaning-booking/cleaning-booking.repository";
import { CleaningSubscriptionRepository } from "../cleaning-subscription/cleaning-subscription.repository";
import { SuccessResponseDto } from "../common/dto/success-response.dto";

@Injectable()
export class DashboardService {
  private readonly logger: Logger = new Logger(DashboardService.name);

  constructor(
    private readonly applicationUserRepository: ApplicationUserRepository,
    private readonly cleaningSubscriptionRepository: CleaningSubscriptionRepository,
    private readonly cleaningBookingRepository: CleaningBookingRepository,
  ) {}

  async getCardStats() {
    try {
      const totalUsers = await this.applicationUserRepository.count({
        role: ApplicationUserRoleEnum.USER,
      });

      const totalSubscriptions =
        await this.cleaningSubscriptionRepository.count();

      const totalEarnings =
        await this.cleaningBookingRepository.getTotalBookingEarnings();

      const totalActiveBookings = await this.cleaningBookingRepository.count({
        isActive: true,
      });

      return new SuccessResponseDto("Stats data fetched successfully", {
        totalUsers,
        totalSubscriptions,
        totalEarnings,
        totalActiveBookings,
      });
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating bookin:", error);
      throw new BadRequestException("Could not update booking");
    }
  }

  async getBookingForUpcomingWeek() {
    try {
      const upcomingSubscriptionBookings =
        await this.cleaningSubscriptionRepository.getSubscriptionsForUpcomingWeek();

      return new SuccessResponseDto(
        "Upcoming booking fetched successfully",
        upcomingSubscriptionBookings,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error getting upcoming booking:", error);
      throw new BadRequestException("Could not get upcoming bookings");
    }
  }

  async getLatestBookingPayments() {
    try {
      const latestPaidBookings =
        await this.cleaningBookingRepository.getLatestPaidBookings();

      return new SuccessResponseDto(
        "Latest paid bookings fetched successfully",
        latestPaidBookings,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error getting latest paid booking:", error);
      throw new BadRequestException("Could not get latest paid bookings");
    }
  }
}
