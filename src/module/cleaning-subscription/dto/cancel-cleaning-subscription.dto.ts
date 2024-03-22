import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class CancelCleaningSubscriptionDto {
  @ApiProperty({
    description: "The ID of cleaning subscription",
    example: "65e1719621d642d46e4c6390",
  })
  @IsNotEmpty({
    message: "Cleaning subscription ID is required",
  })
  @IsMongoId({ message: "Invalid cleaning subscription ID" })
  subscriptionId: string;
}
