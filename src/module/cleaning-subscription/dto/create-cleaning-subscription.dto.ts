import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinDate,
} from "class-validator";

export class CreateCleaningSubscriptionDto {
  @ApiProperty({ description: "Area in square meters", example: 100 })
  @IsNotEmpty({ message: "Area is required" })
  @IsNumber({}, { message: "Area must be a number" })
  @Min(1, { message: "Area must be at least 1 square meter" })
  areaInSquareMeters: number;

  @ApiProperty({ description: "Postal code", example: "12345" })
  @IsNotEmpty({ message: "Postal code is required" })
  @IsNumber(
    { maxDecimalPlaces: 0 },
    { message: "Postal code must be a number" },
  )
  postalCode: number;

  @ApiProperty({ description: "Address", example: "123 Main St, City" })
  @IsNotEmpty({ message: "Address is required" })
  @IsString({ message: "Address must be a string" })
  address: string;

  @ApiProperty({ description: "Duration of cleaning in hours", example: 2 })
  @IsNotEmpty({ message: "Cleaning duration is required" })
  @IsNumber({}, { message: "Cleaning duration must be a number" })
  @Min(1, { message: "Cleaning duration must be at least 1 hour" })
  cleaningDurationInHours: number;

  @ApiProperty({
    required: true,
    description: "The type of cleaning price",
  })
  @IsNotEmpty({ message: "Cleaning price is required" })
  @IsMongoId({ message: "Invalid cleaning price" })
  cleaningPrice: string;

  @ApiProperty({
    description: "Start date of the subscription",
    example: "2024-03-01T00:00:00.000Z",
  })
  @IsNotEmpty({ message: "Start date is required" })
  @IsDate({ message: "Start date must be a valid date" })
  @MinDate(new Date(), { message: "Start date must be in the future" })
  startDate: Date;

  @ApiProperty({
    description: "Indicates if there are cats in the house",
    example: true,
  })
  @IsOptional()
  @IsBoolean({ message: "hasCats must be a boolean value" })
  hasCats?: boolean;

  @ApiProperty({
    description: "Indicates if there are dogs in the house",
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: "hasDogs must be a boolean value" })
  hasDogs?: boolean;

  @ApiProperty({
    description: "Indicates if there are other pets in the house",
    example: false,
  })
  @IsOptional()
  @IsBoolean({ message: "hasOtherPets must be a boolean value" })
  hasOtherPets?: boolean;
}
