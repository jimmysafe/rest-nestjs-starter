import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { Node } from '../common/base/base.entity';

@Entity('posts')
export class Post extends Node {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @ApiProperty({ type: () => User })
  user: User;

  @Column()
  @ApiProperty()
  title: string;

  @Column()
  @ApiProperty()
  content: string;
}
