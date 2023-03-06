import { User } from 'src/user/user.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { formatQueryFilters } from '../helpers';
import { PageMetaDto } from '../pagination/page-meta.dto';
import { PageOptionsDto } from '../pagination/page-options.dto';
import { PageDto } from '../pagination/page.dto';
import { Node } from './base.entity';

export interface IBaseService<T, C, U> {
  findByID(id: string, user?: User): Promise<T | null>;
  findOne(options?: FindOneOptions<T>): Promise<T | null>;
  findAll(options: PageOptionsDto, user?: User): Promise<PageDto<T>>;
  findMany(
    options: FindManyOptions,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<T>>;
  create(input: C, user?: User): Promise<T>;
  update(entity: T, input: U): Promise<T>;
  delete(entity: T): Promise<boolean | null>;
}

interface IEntityClassBuilder<T extends Node> {
  new (): T;
  of(this: new () => T, params: Partial<T> & { user?: User }): T;
}

export class BaseService<T extends Node, C, U>
  implements IBaseService<T, C, U>
{
  constructor(
    protected entity: IEntityClassBuilder<T>,
    protected repository: Repository<T>,
  ) {}

  /**
   * Find a single entity by its ID
   * @param id UUID to query
   * @param relations Entity relations to populate
   */
  async findByID(id: string, user?: User): Promise<T | null> {
    const name = this.entity.name.toLocaleLowerCase();
    const queryBuilder = this.repository.createQueryBuilder(name);

    return queryBuilder
      .where('id = :id', { id })
      .andWhere(!user ? '1=1' : `${name}.userId = :userId`, {
        userId: user?.id,
      })
      .getOne();
  }

  /**
   * Get one entity with conditions
   * @param options conditions
   * @returns T
   */
  async findOne(options: FindOneOptions<T>): Promise<T | null> {
    return this.repository.findOne(options);
  }

  /**
   * Get all entites
   */
  async findAll(options: any, user?: User): Promise<PageDto<T>> {
    const name = this.entity.name.toLocaleLowerCase();
    const queryBuilder = this.repository.createQueryBuilder(name);

    queryBuilder
      .where(!user ? '1=1' : `${name}.userId = :userId`, { userId: user?.id })
      .andWhere(formatQueryFilters(name, options.filters))
      .orderBy(`${name}.created`, options.order)
      .skip(options.skip)
      .take(options.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, options });

    return new PageDto(entities, pageMetaDto);
  }

  /**
   * Get many entites
   */
  async findMany(
    options: FindManyOptions,
    pageOptions: PageOptionsDto,
  ): Promise<PageDto<T>> {
    const name = this.entity.name.toLocaleLowerCase();
    const queryBuilder = this.repository.createQueryBuilder(name);

    queryBuilder
      .where(options.where ?? {})
      .orderBy(`${name}.created`, pageOptions.order)
      .skip(pageOptions.skip)
      .take(pageOptions.take);

    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();

    const pageMetaDto = new PageMetaDto({ itemCount, options: pageOptions });

    return new PageDto(entities, pageMetaDto);
  }

  /**
   * Create a new entity and save to the data store
   * @param input EntityInput object
   */
  async create(input: C, user?: User): Promise<T> {
    const manager = this.repository.manager;
    // @ts-expect-error
    return manager.save(this.entity.of({ ...input, user }));
  }

  /**
   * Update an entity object and save to the data store
   * Only updates fields that are set in the input
   * @param entity Entity object to update
   * @param input Input containing requiring update
   */
  async update(entity: T, input: U): Promise<T> {
    return this.repository.save({
      ...entity,
      ...input,
    });
  }

  /**
   * Delete an entity either by its ID or by providing an entity object
   * @param entity ID as a string, or an entity object
   * @returns The provided entity/ID if successfull, otherwise null
   */
  async delete(entity: T): Promise<boolean | null> {
    await this.repository.remove(entity);
    return true;
  }
}
