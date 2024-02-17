import {
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from "class-validator";

export function IsNotEqualTo(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: "isNotEqualTo",
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const relatedValue = (args.object as any)[args.constraints[0]];
          return value !== relatedValue;
        },
      },
    });
  };
}
