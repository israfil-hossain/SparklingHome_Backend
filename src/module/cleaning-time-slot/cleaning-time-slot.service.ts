import {
  BadRequestException,
  HttpException,
  Injectable,
  Logger,
} from "@nestjs/common";
import { IdNameResponseDto } from "../common/dto/id-name-respones.dto";
import { SuccessResponseDto } from "../common/dto/success-response.dto";
import { CleaningTimeSlotRepository } from "./cleaning-time-slot.repository";
import { CreateCleaningTimeSlotDto } from "./dto/create-cleaning-time-slot.dto";
import { CleaningTimeSlotDocument } from "./entities/cleaning-time-slot.entity";
import { CleaningWeekdayEnum } from "./enum/cleaning-weekday.enum";

@Injectable()
export class CleaningTimeSlotService {
  private readonly logger: Logger = new Logger(CleaningTimeSlotService.name);

  constructor(
    private readonly cleaningTimeSlotRepository: CleaningTimeSlotRepository,
  ) {}

  async create(
    createDto: CreateCleaningTimeSlotDto,
    userId: string,
  ): Promise<SuccessResponseDto> {
    try {
      const result = await this.cleaningTimeSlotRepository.create({
        ...createDto,
        createdBy: userId,
      });

      const response = new IdNameResponseDto(result.id, result.cleaningTime);

      return new SuccessResponseDto("Document created successfully", response);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error creating new document:", error);
      throw new BadRequestException("Error creating new document");
    }
  }

  async findAll(): Promise<SuccessResponseDto> {
    try {
      const results = await this.cleaningTimeSlotRepository.getAll();

      return new SuccessResponseDto("All document fetched", results);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      this.logger.error("Error finding all document:", error);
      throw new BadRequestException("Could not get all document");
    }
  }

  async findAllByWeekdays(): Promise<SuccessResponseDto> {
    const cleaningTimeSlots = await this.cleaningTimeSlotRepository.getAll();
    const result: {
      [key in CleaningWeekdayEnum]?: CleaningTimeSlotDocument[];
    } = {};

    cleaningTimeSlots.forEach((slot) => {
      const weekday = slot.weekday;
      if (!(weekday in result)) {
        result[weekday] = [];
      }
      result[weekday]?.push(slot);
    });

    return new SuccessResponseDto("All document fetched by weekdays", result);
  }
}
