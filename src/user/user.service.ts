import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { Repository } from 'typeorm';
import { UserCreateDto } from './dto/user.create.dto';
import { User } from './user.entity';

@Injectable()
export class UserService extends TypeOrmCrudService<User> {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async register(dto: UserCreateDto): Promise<User> {
    return this.userRepository.create(dto).save();
  }
}
