import { Controller, Get, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningBookingService } from "./cleaning-booking.service";
import { ListCleaningBookingQueryDto } from "./dto/list-cleaning-booking-query.dto";

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
  getAllPaidBooking(
    @AuthUserId() authUser: ITokenPayload,
    @Query() queryDto: ListCleaningBookingQueryDto,
  ) {
    return this.cleaningBookingService.getAllPaidBooking(queryDto, authUser);
  }
}
