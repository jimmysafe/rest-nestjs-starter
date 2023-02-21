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
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Auth, CurrentUser } from '../../auth/auth.decorators';
import { User, UserRole } from '../../user/user.entity';
import { PageOptionsDto } from '../pagination/page-options.dto';
import { ApiPaginatedResponse } from '../pagination/page-response.decorator';
import { PageDto } from '../pagination/page.dto';
import { IdParams } from '../types/id-params';
import { IBaseService } from './base.service';

export interface IBaseController<T, C, U> {
  getOne(params: IdParams): Promise<T | undefined>;
  get(options: PageOptionsDto): Promise<PageDto<T>>;
  create(body: C): Promise<T>;
  update(params: IdParams, body: U): Promise<T>;
  delete(params: IdParams): Promise<boolean | null>;
}

type ControllerFactoryParams<T, C, U> = {
  entity: {
    single: Type<T>;
  };
  create: {
    dto: Type<C>;
    roles?: UserRole[];
    public?: boolean;
    attachUser?: boolean;
  };
  update: {
    dto: Type<U>;
    roles?: UserRole[];
    public?: boolean;
  };
  getOne: {
    roles?: UserRole[];
    public?: boolean;
  };
  get: {
    roles?: UserRole[];
    public?: boolean;
  };
  delete: {
    roles?: UserRole[];
    public?: boolean;
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

export function ControllerFactory<T, C, U>(
  params: ControllerFactoryParams<T, C, U>,
): Type<IBaseController<T, C, U>> {
  const createPipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: params.create.dto },
  );
  const updatePipe = new AbstractValidationPipe(
    { whitelist: true, transform: true },
    { body: params.update.dto },
  );

  class BaseController<T, C, U> implements IBaseController<T, C, U> {
    protected service: IBaseService<T, C, U>;

    @Post()
    @Auth(
      params.create.public,
      ...(params.create?.roles || [UserRole.USER, UserRole.ADMIN]),
    )
    @UsePipes(createPipe)
    @ApiBody({ type: params.create.dto })
    @ApiCreatedResponse({ type: params.entity.single })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async create(@Body() body: C, @CurrentUser() user?: User): Promise<T> {
      const _user = params.create.attachUser ? user : undefined;
      return this.service.create(body, _user);
    }

    @Get(':id')
    @Auth(
      params.getOne.public,
      ...(params.getOne?.roles || [UserRole.USER, UserRole.ADMIN]),
    )
    @ApiParam({
      name: 'id',
      description: `ID of ${params.entity.single.name}`,
    })
    @ApiResponse({ type: params.entity.single })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async getOne(
      @Param()
      params: IdParams,
    ): Promise<T | undefined> {
      return this.service.findByID(params.id);
    }

    @Get()
    @Auth(
      params.get.public,
      ...(params.get?.roles || [UserRole.USER, UserRole.ADMIN]),
    )
    @ApiPaginatedResponse(params.entity.single)
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async get(@Query() optionsDto: PageOptionsDto): Promise<PageDto<T>> {
      return this.service.findAll(optionsDto);
    }

    @Delete(':id')
    @Auth(
      params.delete.public,
      ...(params.delete?.roles || [UserRole.USER, UserRole.ADMIN]),
    )
    @ApiParam({
      name: 'id',
      description: `ID of ${params.entity.single.name}`,
    })
    @ApiResponse({ type: Boolean })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async delete(@Param() params: IdParams): Promise<boolean | null> {
      const item = await this.service.findByID(params.id);
      if (!item) throw new NotFoundException();
      return this.service.delete(item);
    }

    @Patch(':id')
    @UsePipes(updatePipe)
    @Auth(
      params.update.public,
      ...(params.update?.roles || [UserRole.USER, UserRole.ADMIN]),
    )
    @ApiBody({ type: params.update.dto })
    @ApiParam({
      name: 'id',
      description: `ID of ${params.entity.single.name}`,
    })
    @ApiOkResponse({ type: params.entity.single })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    async update(@Param() params: IdParams, @Body() body: U): Promise<T> {
      const item = await this.service.findByID(params.id);
      if (!item) throw new NotFoundException();
      return this.service.update(item, body);
    }
  }

  return BaseController;
}
