import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EmailService } from "../email/email.service";
import { CleaningBookingRepository } from "./cleaning-booking.repository";
import { ListCleaningBookingQueryDto } from "./dto/list-cleaning-booking-query.dto";
import { CleaningBookingStatusEnum } from "./enum/cleaning-booking-status.enum";

@Injectable()
export class CleaningBookingService {
  private readonly logger: Logger = new Logger(CleaningBookingService.name);

  constructor(
    private readonly cleaningBookingRepository: CleaningBookingRepository,
    private readonly emailService: EmailService,
  ) {}

  async getAllPaidBooking(
    queryFilterDto: ListCleaningBookingQueryDto,
    { userId, userRole }: ITokenPayload,
  ): Promise<PaginatedResponseDto> {
    try {
      if (userRole !== ApplicationUserRoleEnum.ADMIN) {
        queryFilterDto.BookingUserId = userId;
      }

      const queryResult =
        await this.cleaningBookingRepository.getAllPaidBookingsByFilter(
          queryFilterDto,
        );

      return new PaginatedResponseDto(
        queryResult.count,
        queryFilterDto.Page ?? 1,
        queryFilterDto.PageSize ?? 10,
        queryResult.results,
      );
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

  async markBookingAsServed(
    bookingId: string,
    authUserId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const booking = await this.cleaningBookingRepository.getOneWhere(
        {
          _id: bookingId,
          isActive: true,
          bookingStatus: CleaningBookingStatusEnum.BookingInitiated,
        },
        {
          populate: ["bookingUser"],
        },
      );

      if (!booking) {
        throw new BadRequestException("Booking is either not found or invalid");
      }

      const updatedBooking = await this.cleaningBookingRepository.updateOneById(
        booking.id,
        {
          bookingStatus: CleaningBookingStatusEnum.BookingServed,
          updatedBy: authUserId,
          updatedAt: new Date(),
        },
      );

      const bookingUser =
        booking?.bookingUser as unknown as ApplicationUserDocument;
      if (bookingUser) {
        this.emailService.sendBookingServedMail(bookingUser.email);
      }

      return new SuccessResponseDto(
        "Successfully marked booking as served",
        updatedBooking,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating booking:", error);
      throw new BadRequestException("Could not update booking");
    }
  }
}
