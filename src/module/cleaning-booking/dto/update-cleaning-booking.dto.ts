import { PartialType } from '@nestjs/swagger';
import { CreateCleaningBookingDto } from './create-cleaning-booking.dto';

export class UpdateCleaningBookingDto extends PartialType(CreateCleaningBookingDto) {}
