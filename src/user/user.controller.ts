import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CrudController } from '@nestjsx/crud';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('me')
@ApiTags('User')
export class UserController implements CrudController<User> {
  constructor(public service: UserService) {}
}
