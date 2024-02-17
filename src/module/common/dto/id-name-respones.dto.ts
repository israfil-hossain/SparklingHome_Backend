import { ApiProperty } from "@nestjs/swagger";

export class IdNameResponseDto {
  @ApiProperty({
    description: "The unique identifier for the object.",
    example: "60adadfe2423d81d0c605b6f",
    format: "MongoDB ObjectId",
  })
  public id: string;

  @ApiProperty({
    description: "The name associated with the object.",
    example: "John Doe",
  })
  public name: string;

  constructor(id: string = "", name: string = "") {
    this.id = id;
    this.name = name;
  }
}
