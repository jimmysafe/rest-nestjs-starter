import {
  ArgumentMetadata,
  Body,
  Delete,
  Get,
  Injectable,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Type,
  UsePipes,
  ValidationPipe,
  ValidationPipeOptions,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { In } from 'typeorm';
import { Auth, CurrentUser } from '../../auth/auth.decorators';
import { User, UserRole } from '../../user/user.entity';
import { ApiFilterQuery } from '../decorators/ApiFilterQuery';
import { PageOptionsDto } from '../pagination/page-options.dto';
import { ApiPaginatedResponse } from '../pagination/page-response.decorator';
import { PageDto } from '../pagination/page.dto';
import { IdParams } from '../types/id-params';
import { IBaseService } from './base.service';

export interface IBaseController<T, C, U> {
  getOne(params: IdParams, user?: User): Promise<T>;
  get(options: PageOptionsDto): Promise<PageDto<T>>;
  create(body: C): Promise<T>;
  update(params: IdParams, body: U): Promise<T>;
  delete(params: IdParams, user?: User): Promise<boolean | null>;
}

type ControllerFactoryParams<T, C, U, F> = {
  entity: {
    single: Type<T>;
  };
  create: {
    dto: Type<C>;
    roles: UserRole[];
    attachUser?: boolean;
  };
  update: {
    dto: Type<U>;
    roles: UserRole[];
    byUser?: boolean;
  };
  getOne: {
    roles: UserRole[];
    byUser?: boolean;
    relations?: (keyof T)[];
  };
  get: {
    roles: UserRole[];
    byUser?: boolean;
    filterDto: Type<F>;
    relations?: (keyof T)[];
  };
  delete: {
    roles: UserRole[];
    byUser?: boolean;
  };
};

@Injectable()
export class AbstractValidationPipe extends ValidationPipe {
  constructor(
    options: ValidationPipeOptions,
    private readonly targetTypes: { body?: Type; query?: Type; param?: Type },
  ) {
    super(options);
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    // @ts-expect-error
    const targetType = this.targetTypes[metadata.type];
    if (!targetType) {
      return super.transform(value, metadata);
    }
    return super.transform(value, { ...metadata, metatype: targetType });
  }
}

export function ControllerFactory<T, C, U, F>(
  params: ControllerFactoryParams<T, C, U, F>,
): Type<IBaseController<T, C, U>> {
  const createPipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: params.create.dto },
  );
  const updatePipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: params.update.dto },
  );

  @ApiBearerAuth()
  class BaseController<T, C, U> implements IBaseController<T, C, U> {
    protected service: IBaseService<T, C, U>;

    @Post()
    @Auth(...(params.create?.roles || []))
    @UsePipes(createPipe)
    @ApiBody({ type: params.create.dto })
    @ApiCreatedResponse({ type: params.entity.single })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async create(@Body() body: C, @CurrentUser() user?: User): Promise<T> {
      const _user = params.create.attachUser ? user : undefined;
      return this.service.create(body, _user);
    }

    @Get(':id')
    @Auth(...(params.getOne?.roles || []))
    @ApiParam({
      name: 'id',
      description: `ID of ${params.entity.single.name}`,
    })
    @ApiOkResponse({ type: params.entity.single })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getOne(
      @Param()
      queryParams: IdParams,
      @CurrentUser() user: User,
    ): Promise<T> {
      const item = await this.service.findByID(
        queryParams.id,
        params.getOne.byUser && user ? user : undefined,
        params.getOne.relations,
      );

      if (!item) throw new NotFoundException();
      return item;
    }

    @Get()
    @Auth(...(params.get?.roles || []))
    @ApiPaginatedResponse(params.entity.single)
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    @ApiFilterQuery('filters', params.get.filterDto)
    async get(
      @Query() optionsDto: PageOptionsDto,
      @CurrentUser() user?: User,
    ): Promise<PageDto<T>> {
      if (optionsDto.ids)
        return this.service.findMany(
          { where: { id: In(optionsDto.ids.split(',')) } },
          optionsDto,
          params.get.relations,
        );
      return this.service.findAll(
        optionsDto,
        params.get.byUser && user ? user : undefined,
        params.get.relations,
      );
    }

    @Delete(':id')
    @Auth(...(params.delete?.roles || []))
    @ApiParam({
      name: 'id',
      description: `ID of ${params.entity.single.name}`,
    })
    @ApiOkResponse({ type: Boolean })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async delete(
      @Param() queryParams: IdParams,
      @CurrentUser() user?: User,
    ): Promise<boolean | null> {
      const item = await this.service.findByID(
        queryParams.id,
        params.delete.byUser && user ? user : undefined,
      );
      if (!item) throw new NotFoundException();
      return this.service.delete(item);
    }

    @Patch(':id')
    @UsePipes(updatePipe)
    @Auth(...(params.update?.roles || []))
    @ApiBody({ type: params.update.dto })
    @ApiParam({
      name: 'id',
      description: `ID of ${params.entity.single.name}`,
    })
    @ApiOkResponse({ type: params.entity.single })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async update(
      @Param() queryParams: IdParams,
      @Body() body: U,
      @CurrentUser() user?: User,
    ): Promise<T> {
      const item = await this.service.findByID(
        queryParams.id,
        params.update.byUser && user ? user : undefined,
      );
      if (!item) throw new NotFoundException();
      return this.service.update(item, body);
    }
  }

  return BaseController;
}
