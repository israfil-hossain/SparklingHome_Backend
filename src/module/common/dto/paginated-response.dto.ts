import { ApiProperty } from "@nestjs/swagger";

export class PaginatedResponseDto {
  @ApiProperty({ description: "Total number of records" })
  readonly totalRecords: number;

  @ApiProperty({ description: "Total number of pages" })
  readonly totalPages: number;

  @ApiProperty({ description: "Current page number" })
  readonly currentPage: number;

  @ApiProperty({ description: "Number of items per page" })
  readonly pageSize: number;

  @ApiProperty({
    description: "Boolean indicating if there is a previous page",
  })
  readonly hasPreviousPage: boolean;

  @ApiProperty({
    description: "Boolean indicating if there is a next page",
  })
  readonly hasNextPage: boolean;

  @ApiProperty({ description: "Array of data for the current page" })
  readonly data: object[];

  constructor(
    totalRecords: number,
    currentPage: number,
    pageSize: number,
    data: object[] = [],
  ) {
    this.totalRecords = totalRecords;
    this.totalPages = Math.ceil(totalRecords / pageSize);
    this.currentPage = currentPage;
    this.pageSize = pageSize;
    this.hasPreviousPage = currentPage > 1;
    this.hasNextPage = currentPage < this.totalPages;
    this.data = data;
  }
}
