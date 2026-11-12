import { Repository, ObjectLiteral } from "typeorm";

export abstract class BaseDao<T extends ObjectLiteral> {
  protected repository: Repository<T>;

  constructor(repository: Repository<T>) {
    this.repository = repository;
  }

  async create(data: Partial<T>): Promise<T> {
    const entity = this.repository.create(data as T);
    return this.repository.save(entity);
  }

  async findById(id: string | number): Promise<T | null> {
    return this.repository.findOneBy({ id } as any);
  }

  async findOne(where: Partial<T>): Promise<T | null> {
    return this.repository.findOneBy(where as any);
  }

  async findAll(): Promise<T[]> {
    return this.repository.find();
  }

  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    await this.repository.update({ id } as any, data);
    return this.findById(id);
  }

  async delete(id: string | number): Promise<boolean> {
    const result = await this.repository.delete({ id } as any);
    return (result.affected ?? 0) > 0;
  }
}
