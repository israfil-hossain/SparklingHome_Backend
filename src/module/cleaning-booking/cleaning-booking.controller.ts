import { Controller, Get, Param, Patch, Query } from "@nestjs/common";
import { ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { DocIdQueryDto } from "../common/dto/doc-id-query.dto";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
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
    type: PaginatedResponseDto,
  })
  getAllPaidBooking(
    @AuthUserId() authUser: ITokenPayload,
    @Query() queryDto: ListCleaningBookingQueryDto,
  ) {
    return this.cleaningBookingService.getAllPaidBooking(queryDto, authUser);
  }

  @Patch("MarkBookingAsServedById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  markBookingAsServedById(
    @AuthUserId() { userId }: ITokenPayload,
    @Param() { DocId }: DocIdQueryDto,
  ) {
    return this.cleaningBookingService.markBookingAsServed(DocId, userId);
  }
}
