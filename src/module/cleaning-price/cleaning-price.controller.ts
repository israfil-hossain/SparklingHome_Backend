import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RequiredRoles } from "../application-user/decorator/roles.decorator";
import { ApplicationUserRoleEnum } from "../application-user/enum/application-user-role.enum";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningPriceService } from "./cleaning-price.service";
import { CreateCleaningPriceDto } from "./dto/create-cleaning-price.dto";

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
}
