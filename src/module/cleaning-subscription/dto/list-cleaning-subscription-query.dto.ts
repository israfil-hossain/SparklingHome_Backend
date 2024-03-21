import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationQuery } from "../../common/dto/pagintation-query.dto";
import { CleaningSubscriptionFrequencyEnum } from "../enum/cleaning-subscription-frequency.enum";

export class ListCleaningSubscriptionQueryDto extends PaginationQuery {
  @ApiProperty({
    required: false,
    enum: CleaningSubscriptionFrequencyEnum,
    default: CleaningSubscriptionFrequencyEnum.WEEKLY,
    description: "The frequency of the cleaning subscription.",
  })
  @IsEnum(CleaningSubscriptionFrequencyEnum, {
    message: "Invalid subscription frequency",
  })
  @IsOptional()
  Frequency?: CleaningSubscriptionFrequencyEnum;
}
