import { Post } from '../post/post.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Node } from '../common/base/base.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

@Entity('users')
export class User extends Node {
  // @OneToMany(() => Comment, (comment) => comment.user)
  // @ApiProperty({ type: () => [Comment], isArray: true })
  // comments?: Comment[];

  @OneToMany(() => Post, (post) => post.user, {
    nullable: true,
  })
  @ApiProperty({ type: () => [Post], isArray: true })
  posts?: Post[];

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @Column()
  @ApiProperty()
  nome: string;

  @Column()
  @ApiProperty()
  cognome: string;

  @Column({ unique: true })
  @ApiProperty()
  email: string;

  @Column({ nullable: true })
  @ApiProperty()
  telefono?: string;
}
