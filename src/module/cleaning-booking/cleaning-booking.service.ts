import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { UpdateQuery } from "mongoose";
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

  async update(
    bookingId: string,
    bookingUpdateDto: UpdateCleaningBookingDto,
    authUserId: string,
  ): Promise<SuccessResponseDto> {
    try {
      if (Object.keys(bookingUpdateDto).length < 1)
        throw new BadRequestException("No fields to update");

      const currentBooking = await this.cleaningBookingRepository.getOneWhere({
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
      });

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

      if (
        bookingUpdateDto.markAsServed &&
        currentBooking.bookingStatus !== CleaningBookingStatusEnum.BookingServed
      ) {
        updateQuery.bookingStatus = CleaningBookingStatusEnum.BookingServed;
        this.logger.log("Sending email to customer");
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

      this.logger.error("Error updating bookin:", error);
      throw new BadRequestException("Could not update booking");
    }
  }
}
