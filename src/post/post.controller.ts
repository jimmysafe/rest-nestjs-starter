import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/user/user.entity';
import { ControllerFactory } from '../common/base/base.controller';
import { PostCreateDto } from './dto/post.create.dto';
import { PostFilterDto } from './dto/post.filter.dto';
import { PostUpdateDto } from './dto/post.update.dto';
import { Post } from './post.entity';
import { PostService } from './post.service';

@Controller('posts')
@ApiTags('Posts')
export class PostController extends ControllerFactory<
  Post,
  PostCreateDto,
  PostUpdateDto,
  PostFilterDto
>({
  entity: {
    single: Post,
  },
  create: {
    dto: PostCreateDto,
    roles: [UserRole.USER],
    attachUser: true,
  },
  update: {
    dto: PostUpdateDto,
    roles: [UserRole.USER],
    byUser: true,
  },
  delete: {
    roles: [UserRole.USER],
    byUser: true,
  },
  get: {
    roles: [UserRole.USER],
    filterDto: PostFilterDto,
    byUser: true,
  },
  getOne: {
    roles: [UserRole.USER],
    byUser: true,
  },
}) {
  constructor(protected service: PostService) {
    super();
  }
}
