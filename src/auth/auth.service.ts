import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from '../user/user.entity';
import { UserService } from '../user/user.service';

export type AuthUser = {
  id: string;
  role: UserRole;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  /**
   * Make sure the user exists, and they have the required permissions
   * @param id ID of the user to verify
   */
  async validateUser(id: string): Promise<User | null> {
    const user = await this.userService.findOne({ where: { id } });
    if (!user) throw new UnauthorizedException();

    return user;
  }
}
