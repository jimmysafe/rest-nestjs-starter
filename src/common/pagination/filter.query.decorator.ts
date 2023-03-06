import { applyDecorators, Type } from '@nestjs/common';
import { ApiQuery, getSchemaPath } from '@nestjs/swagger';

export const ApiQueryWithFilters = <TModel extends Type<any>>(
  model: TModel,
) => {
  return applyDecorators(
    ApiQuery({
      name: 'filter',
      schema: {
        type: 'array',
        example: [],
        items: {
          $ref: getSchemaPath(model),
        },
      },
    }),
  );
};
