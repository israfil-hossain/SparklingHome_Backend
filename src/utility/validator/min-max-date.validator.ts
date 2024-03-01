import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";

export function MinDate(minDate: Date, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "minDate",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [minDate],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const minDate = args.constraints[0];
          const selectedDate = new Date(value);
          return selectedDate >= minDate;
        },
      },
    });
  };
}

export function MaxDate(maxDate: Date, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "maxDate",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [maxDate],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const maxDate = args.constraints[0];
          const selectedDate = new Date(value);
          return selectedDate <= maxDate;
        },
      },
    });
  };
}
