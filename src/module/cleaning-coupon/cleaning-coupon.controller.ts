import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { DocIdQueryDto } from "../common/dto/doc-id-query.dto";
import { PaginatedResponseDto } from "../common/dto/paginated-response.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningCouponService } from "./cleaning-coupon.service";
import { CreateCleaningCouponDto } from "./dto/create-cleaning-coupon.dto";
import { ListCleaningCouponQueryDto } from "./dto/list-cleaning-coupon-query.dto";
import { UpdateCleaningCouponDto } from "./dto/update-cleaning-coupon.dto";
import { VerifyCleaningCouponDto } from "./dto/verify-cleaning-coupon.dto";

@ApiTags("Cleaning Coupons")
@Controller("CleaningCoupon")
export class CleaningCouponController {
  constructor(private readonly cleaningCouponService: CleaningCouponService) {}

  @Post("Create")
  @ApiBody({ type: CreateCleaningCouponDto })
  @ApiResponse({
    status: 201,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  create(
    @AuthUserId() { userId }: ITokenPayload,
    @Body() createCleaningCouponDto: CreateCleaningCouponDto,
  ) {
    return this.cleaningCouponService.create(createCleaningCouponDto, userId);
  }

  @Get("GetAll")
  @ApiResponse({
    status: 200,
    type: PaginatedResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  findAll(@Query() query: ListCleaningCouponQueryDto) {
    return this.cleaningCouponService.findAll(query);
  }

  @Get("GetById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  findOne(@Param() { DocId }: DocIdQueryDto) {
    return this.cleaningCouponService.findOne(DocId);
  }

  @Patch("UpdateById/:DocId")
  @ApiBody({ type: UpdateCleaningCouponDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  update(
    @Param() { DocId }: DocIdQueryDto,
    @AuthUserId() { userId }: ITokenPayload,
    @Body() updateDto: UpdateCleaningCouponDto,
  ) {
    return this.cleaningCouponService.update(DocId, updateDto, userId);
  }

  @Delete("DeleteById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  remove(@Param() { DocId }: DocIdQueryDto) {
    return this.cleaningCouponService.remove(DocId);
  }

  @Post("VerifyByCode")
  @ApiBody({ type: VerifyCleaningCouponDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @IsPublic()
  verifyCouponCode(@Body() verifyCouponDto: VerifyCleaningCouponDto) {
    return this.cleaningCouponService.verifyCouponCode(
      verifyCouponDto.couponCode,
    );
  }
}
