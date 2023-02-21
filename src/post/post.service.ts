import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './post.entity';
import { PostCreateDto } from './dto/post.create.dto';
import { PostUpdateDto } from './dto/post.update.dto';
import { BaseService } from '../common/base/base.service';

@Injectable()
export class PostService extends BaseService<
  Post,
  PostCreateDto,
  PostUpdateDto
> {
  constructor(
    @InjectRepository(Post)
    protected postRepository: Repository<Post>,
  ) {
    super(Post, postRepository);
  }
}
