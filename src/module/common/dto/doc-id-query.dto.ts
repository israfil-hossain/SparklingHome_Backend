import { ApiProperty } from "@nestjs/swagger";
import { IsMongoId, IsNotEmpty } from "class-validator";

export class DocIdQueryDto {
  @ApiProperty({
    description: "Document model Id",
  })
  @IsMongoId()
  @IsNotEmpty()
  readonly DocId: string;
}
