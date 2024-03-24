import { Body, Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { DocIdQueryDto } from "../common/dto/doc-id-query.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningBookingService } from "./cleaning-booking.service";
import { ListCleaningBookingQueryDto } from "./dto/list-cleaning-booking-query.dto";
import { UpdateCleaningBookingDto } from "./dto/update-cleaning-booking.dto";

@ApiTags("Cleaning Bookings")
@Controller("CleaningBooking")
export class CleaningBookingController {
  constructor(
    private readonly cleaningBookingService: CleaningBookingService,
  ) {}

  @Get("GetTopBookingUsers")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  getTopBookingUsers() {
    return this.cleaningBookingService.getTopBookingUsers();
  }

  @Get("GetAllPaidBooking")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  getAllPaidBooking(@Query() queryDto: ListCleaningBookingQueryDto) {
    return this.cleaningBookingService.getAllPaidBooking(queryDto);
  }

  @Patch("UpdateById/:DocId")
  @ApiBody({ type: UpdateCleaningBookingDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  updateSubscriptionBooking(
    @Param() { DocId: bookingId }: DocIdQueryDto,
    @AuthUserId() { userId }: ITokenPayload,
    @Body() updateDto: UpdateCleaningBookingDto,
  ) {
    return this.cleaningBookingService.updateBooking(
      bookingId,
      updateDto,
      userId,
    );
  }
}
