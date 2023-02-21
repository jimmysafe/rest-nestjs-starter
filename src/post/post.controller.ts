import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { Auth, CurrentUser } from 'src/auth/auth.decorators';
import { PageOptionsDto } from 'src/common/pagination/page-options.dto';
import { ApiPaginatedResponse } from 'src/common/pagination/page-response.decorator';
import { User, UserRole } from 'src/user/user.entity';
import { ControllerFactory } from '../common/base/base.controller';
import { PostCreateDto } from './dto/post.create.dto';
import { PostUpdateDto } from './dto/post.update.dto';
import { Post } from './post.entity';
import { PostService } from './post.service';

@Controller('posts')
@ApiTags('Posts')
export class PostController extends ControllerFactory<
  Post,
  PostCreateDto,
  PostUpdateDto
>({
  entity: {
    single: Post,
  },
  create: {
    dto: PostCreateDto,
    roles: [],
    attachUser: true,
  },
  update: {
    dto: PostUpdateDto,
    roles: [],
  },
  delete: {
    roles: [],
  },
  get: {
    roles: [],
    // public: true,
  },
  getOne: {
    roles: [],
  },
}) {
  constructor(protected service: PostService) {
    super();
  }

  @Get('user')
  @Auth(false, UserRole.USER)
  @ApiPaginatedResponse(Post)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getByUser(
    @Query() optionsDto: PageOptionsDto,
    @CurrentUser() user: User,
  ) {
    return this.service.findMany({ where: { user } }, optionsDto);
  }
}
