import {
  BadRequestException,
  HttpStatus,
  ValidationPipe,
} from "@nestjs/common";
import { APP_PIPE } from "@nestjs/core";
import { ValidationError } from "class-validator";

const exceptionFactory = (errors: ValidationError[]) => {
  const formattedErrors: any = {};
  errors.forEach((error) => {
    const propertyName = error.property;
    if (error.children && error.children.length > 0) {
      // Handle nested errors recursively
      formattedErrors[propertyName] = exceptionFactory(
        error.children as ValidationError[],
      );
    } else {
      const constraints = error.constraints || {};
      if (!formattedErrors[propertyName]) {
        formattedErrors[propertyName] = [];
      }
      Object.values(constraints).forEach((constraint) => {
        if (typeof constraint === "string") {
          formattedErrors[propertyName].push(constraint);
        }
      });
    }
  });
  return formattedErrors;
};

export const ValidationProvider = {
  provide: APP_PIPE,
  useFactory: () =>
    new ValidationPipe({
      transform: true,
      whitelist: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = exceptionFactory(errors);
        return new BadRequestException({
          message: "Validation failed",
          error: formattedErrors,
          statusCode: HttpStatus.BAD_REQUEST,
        });
      },
    }),
};
