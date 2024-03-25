import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsOptional, IsString } from "class-validator";
import { PaginationQuery } from "../../common/dto/pagintation-query.dto";

export class ListApplicationUserQuery extends PaginationQuery {
  @ApiProperty({
    description: "Email of the user",
    required: false,
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.toLowerCase())
  public readonly Email?: string;

  @ApiProperty({
    description: "Name of the user",
    required: false,
  })
  @Type(() => String)
  @IsString()
  @IsOptional()
  public readonly Name?: string;
}
