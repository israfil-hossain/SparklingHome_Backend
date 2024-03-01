import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, Matches } from "class-validator";
import { CleaningWeekdayEnum } from "../enum/cleaning-weekday.enum";

export class CreateCleaningTimeSlotDto {
  @ApiProperty({ description: "The cleaning time in HH:mm format" })
  @IsNotEmpty()
  @Matches(/\d{2}:\d{2}/, { message: "Cleaning time must be in HH:mm format" })
  cleaningTime: string;

  @ApiProperty({
    enum: CleaningWeekdayEnum,
    description: "The weekday for the cleaning time slot",
  })
  @IsNotEmpty()
  @IsEnum(CleaningWeekdayEnum)
  weekday: CleaningWeekdayEnum;
}
