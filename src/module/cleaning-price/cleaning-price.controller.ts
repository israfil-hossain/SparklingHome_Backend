import { Body, Controller, Get, Param, Patch, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { DocIdQueryDto } from "../common/dto/doc-id-query.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningPriceService } from "./cleaning-price.service";
import { CreateCleaningPriceDto } from "./dto/create-cleaning-price.dto";
import { UpdateCleaningPriceDto } from "./dto/update-cleaning-price.dto";

@ApiTags("Cleaning Prices")
@Controller("CleaningPrice")
export class CleaningPriceController {
  constructor(private readonly cleaningPriceService: CleaningPriceService) {}

  @Post("Create")
  @ApiBody({ type: CreateCleaningPriceDto })
  @ApiResponse({
    status: 201,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  create(
    @AuthUserId() { userId }: ITokenPayload,
    @Body() createDto: CreateCleaningPriceDto,
  ) {
    return this.cleaningPriceService.create(createDto, userId);
  }

  @Get("GetAll")
  @IsPublic()
  findAll() {
    return this.cleaningPriceService.findAll();
  }

  @Get("GetAllSubscriptionFrequenciesForDropdown")
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  getSubscriptionFrequencies() {
    return this.cleaningPriceService.getSubscriptionFrequencies();
  }

  @Get("GetById/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  findOne(@Param() { DocId }: DocIdQueryDto) {
    return this.cleaningPriceService.findOne(DocId);
  }

  @Patch("UpdateById/:DocId")
  @ApiBody({ type: UpdateCleaningPriceDto })
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  @RequiredRoles([ApplicationUserRoleEnum.ADMIN])
  update(
    @Param() { DocId }: DocIdQueryDto,
    @AuthUserId() { userId }: ITokenPayload,
    @Body() updateDto: UpdateCleaningPriceDto,
  ) {
    return this.cleaningPriceService.update(DocId, updateDto, userId);
  }
}
