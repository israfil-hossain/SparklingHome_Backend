import { ApiProperty } from "@nestjs/swagger";

export class SuccessResponseDto<T = any> {
  @ApiProperty({
    description: "Message indicating the success status",
  })
  protected readonly message: string;

  @ApiProperty({
    description: "Optional data associated with the success response",
  })
  protected readonly data?: T;

  constructor(message: string, data?: T) {
    this.message = message;
    this.data = data;
  }
}
