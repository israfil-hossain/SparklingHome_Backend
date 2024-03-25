import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinDate,
} from "class-validator";
import { CleaningSubscriptionFrequencyEnum } from "../enum/cleaning-subscription-frequency.enum";

export class CreateCleaningSubscriptionDto {
  @ApiProperty({ description: "Full Name", example: "John Doe" })
  @IsNotEmpty({ message: "Full Name is required" })
  @IsString({ message: "Full Name must be a string" })
  userFullName: string;

  @ApiProperty({ description: "Email", example: "john@example.com" })
  @IsNotEmpty({ message: "Email is required" })
  @IsEmail({}, { message: "Invalid email format" })
  @Transform(({ value }) => value?.toLowerCase())
  userEmail: string;

  @ApiProperty({ description: "Phone Number", example: "1234567890" })
  @IsNotEmpty({ message: "Phone Number is required" })
  @IsString({ message: "Phone Number must be a string" })
  userPhoneNumber: string;

  @ApiProperty({
    description: "Personal Identification Number",
    example: "123456789",
  })
  @IsNotEmpty({ message: "Personal Identification Number is required" })
  @IsString({ message: "Personal Identification Number must be a string" })
  userPidNumber: string;

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
    required: false,
    description: "The ID of cleaning coupon",
    example: "65e1719621d642d46e4c6390",
  })
  @IsMongoId({ message: "Invalid cleaning coupon" })
  @IsOptional()
  cleaningCoupon?: string;

  @ApiProperty({
    description: "Start date of the subscription",
    example: "2024-03-01T00:00:00.000Z",
  })
  @IsNotEmpty({ message: "Start date is required" })
  @IsDate({ message: "Start date must be a valid date" })
  @MinDate(new Date(), { message: "Start date must be in the future" })
  startDate: Date;

  @ApiProperty({
    enum: CleaningSubscriptionFrequencyEnum,
    default: CleaningSubscriptionFrequencyEnum.WEEKLY,
    description: "The frequency of the cleaning subscription.",
  })
  @IsNotEmpty({ message: "Subscription frequency is required" })
  @IsEnum(CleaningSubscriptionFrequencyEnum, {
    message: "Invalid subscription frequency",
  })
  subscriptionFrequency: CleaningSubscriptionFrequencyEnum;

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
