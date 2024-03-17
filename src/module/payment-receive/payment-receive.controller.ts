import {
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import { ApiExcludeEndpoint, ApiResponse, ApiTags } from "@nestjs/swagger";
import {
  HostHeader,
  OriginHeader,
} from "../../utility/decorator/request-header.decorator";
import { AuthUserId } from "../authentication/decorator/auth-user-id.decorator";
import { IsPublic } from "../authentication/guard/authentication.guard";
import { DocIdQueryDto } from "../common/dto/doc-id-query.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { PaymentReceiveService } from "./payment-receive.service";

@ApiTags("Payment Receive")
@Controller("PaymentReceive")
export class PaymentReceiveController {
  constructor(private readonly paymentService: PaymentReceiveService) {}

  @Get("GetIntentByBookingId/:DocId")
  @ApiResponse({
    status: 200,
    type: SuccessResponseDto,
  })
  getPaymentIntent(
    @HostHeader() hostUrl: string,
    @OriginHeader() originUrl: string,
    @AuthUserId() { userId }: ITokenPayload,
    @Param() { DocId }: DocIdQueryDto,
  ) {
    const webhookUrl = `/api/PaymentReceive/WebhookEvent`;
    // const webhookUrl = `https://sparkling-home-api.vercel.app/api/PaymentReceive/WebhookEvent`;
    return this.paymentService.getPaymentIntent(
      DocId,
      userId,
      hostUrl,
      webhookUrl,
      originUrl,
    );
  }

  @Post("WebhookEvent")
  @HttpCode(200)
  @IsPublic()
  @ApiExcludeEndpoint()
  async handleWebhookEvent(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string,
  ): Promise<void> {
    await this.paymentService.handleWebhookEvent(req, signature);
  }
}
