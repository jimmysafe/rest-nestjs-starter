import { ApiProperty } from '@nestjs/swagger';
import {
  BaseEntity,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class Node extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @CreateDateColumn()
  @ApiProperty()
  created: Date = new Date();

  @UpdateDateColumn()
  @ApiProperty()
  updated: Date = new Date();

  /**
   * Create a new entity
   * @param params entity input
   */
  public static of<T extends Node>(this: new () => T, params: Partial<T>): T {
    const entity = new this();

    Object.assign(entity, params);

    return entity;
  }
}
