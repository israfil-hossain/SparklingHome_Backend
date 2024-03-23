import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { UpdateQuery } from "mongoose";
import { ApplicationUserDocument } from "../application-user/entities/application-user.entity";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { EmailService } from "../email/email.service";
import { CleaningBookingRepository } from "./cleaning-booking.repository";
import { UpdateCleaningBookingDto } from "./dto/update-cleaning-booking.dto";
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

  async updateBooking(
    bookingId: string,
    bookingUpdateDto: UpdateCleaningBookingDto,
    authUserId: string,
  ): Promise<SuccessResponseDto> {
    try {
      if (Object.keys(bookingUpdateDto).length < 1)
        throw new BadRequestException("No fields to update");

      const currentBooking = await this.cleaningBookingRepository.getOneWhere(
        {
          _id: bookingId,
          isActive: true,
          bookingStatus: {
            $nin: [
              CleaningBookingStatusEnum.BookingCancelled,
              CleaningBookingStatusEnum.BookingCompleted,
            ],
          },
          paymentStatus: {
            $ne: CleaningBookingPaymentStatusEnum.PaymentCompleted,
          },
        },
        {
          populate: "bookingUser",
        },
      );

      if (!currentBooking)
        throw new BadRequestException(
          "No active booking found with id: " + bookingId,
        );

      const updateQuery: UpdateQuery<CleaningBookingDocument> = {
        updatedBy: authUserId,
        updatedAt: new Date(),
      };

      if (bookingUpdateDto.cleaningDate) {
        updateQuery.cleaningDate = bookingUpdateDto.cleaningDate;
      }

      if (bookingUpdateDto.remarks) {
        updateQuery.remarks = bookingUpdateDto.remarks;
      }

      if (bookingUpdateDto.additionalCharges) {
        updateQuery.additionalCharges = bookingUpdateDto.additionalCharges;

        updateQuery.totalAmount = Math.ceil(
          currentBooking.cleaningPrice +
            bookingUpdateDto.additionalCharges +
            currentBooking.suppliesCharges -
            currentBooking.discountAmount,
        );
      }

      if (bookingUpdateDto.markAsServed) {
        if (
          currentBooking.bookingStatus ===
          CleaningBookingStatusEnum.BookingServed
        )
          throw new BadRequestException("Booking is already marked as served");

        updateQuery.bookingStatus = CleaningBookingStatusEnum.BookingServed;
        this.logger.log("Sending email to customer");
        const bookingUser =
          currentBooking.bookingUser as unknown as ApplicationUserDocument;
        this.emailService.sendBookingServedMail(
          bookingUser.email,
          bookingUser.fullName,
          currentBooking,
        );
      }

      const updatedBooking = await this.cleaningBookingRepository.updateOneById(
        currentBooking.id,
        updateQuery,
      );

      return new SuccessResponseDto(
        "Booking updated successfully",
        updatedBooking,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error updating booking:", error);
      throw new BadRequestException("Could not update booking");
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
