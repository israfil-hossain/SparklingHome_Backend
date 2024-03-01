import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, Matches } from "class-validator";
import { CleaningWeekdayEnum } from "../enum/cleaning-weekday.enum";

export class CreateCleaningTimeSlotDto {
  @ApiProperty({
    description: "The cleaning time in HH:mm format",
    example: "15:40",
  })
  @IsNotEmpty()
  @Matches(/^([01]?\d|2[0-4]):([0-5]?\d)$/, {
    message: "Cleaning time must be in HH:mm format and valid time",
  })
  cleaningTime: string;

  @ApiProperty({
    enum: CleaningWeekdayEnum,
    description: "The weekday for the cleaning time slot",
  })
  @IsNotEmpty()
  @IsEnum(CleaningWeekdayEnum)
  weekday: CleaningWeekdayEnum;
}
