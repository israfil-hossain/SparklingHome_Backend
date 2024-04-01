import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { FilterQuery } from "mongoose";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EmailService } from "../email/email.service";
import { CleaningBookingRepository } from "./cleaning-booking.repository";
import { ListCleaningBookingQueryDto } from "./dto/list-cleaning-booking-query.dto";
import { CleaningBookingDocument } from "./entities/cleaning-booking.entity";
import { CleaningBookingPaymentStatusEnum } from "./enum/cleaning-booking-payment-status.enum";
import { CleaningBookingStatusEnum } from "./enum/cleaning-booking-status.enum";

@Injectable()
export class CleaningBookingService {
  private readonly logger: Logger = new Logger(CleaningBookingService.name);

  constructor(
    private readonly cleaningBookingRepository: CleaningBookingRepository,
    private readonly emailService: EmailService,
  ) {}

  async getAllPaidBooking(
    {
      Page = 1,
      PageSize = 10,
      BookingUserId = "",
    }: ListCleaningBookingQueryDto,
    { userId, userRole }: ITokenPayload,
  ): Promise<PaginatedResponseDto> {
    try {
      // Search query setup
      const searchQuery: FilterQuery<CleaningBookingDocument> = {
        bookingStatus: CleaningBookingStatusEnum.BookingCompleted,
        paymentStatus: CleaningBookingPaymentStatusEnum.PaymentCompleted,
      };

      if (userRole !== ApplicationUserRoleEnum.ADMIN) {
        searchQuery.bookingUser = userId;
      } else if (!!BookingUserId) {
        searchQuery.bookingUser = BookingUserId;
      }

      // Pagination setup
      const totalRecords =
        await this.cleaningBookingRepository.count(searchQuery);
      const skip = (Page - 1) * PageSize;

      const result = await this.cleaningBookingRepository.getAll(searchQuery, {
        limit: PageSize,
        skip,
        populate: [
          {
            path: "bookingUser",
            select: "email fullName profilePicture",
          },
          { path: "paymentReceive", select: "-_id totalPaid paymentIntentId" },
        ],
      });

      return new PaginatedResponseDto(totalRecords, Page, PageSize, result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding users:", error);
      throw new BadRequestException("Could not get all users");
    }
  }

  async getTopBookingUsers(): Promise<SuccessResponseDto> {
    try {
      const result =
        await this.cleaningBookingRepository.findTopUsersByBooking();

      return new SuccessResponseDto("All top users fetched", result);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error fetching booking users:", error);
      throw new BadRequestException("Could not get booking users");
    }
  }
}
