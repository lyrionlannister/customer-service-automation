import { Repository } from "typeorm";
import { Supplier } from "../entities/supplier.entity.js";

export class SupplierDao {
  constructor(private repository: Repository<Supplier>) {}

  async findAll(): Promise<Supplier[]> {
    return this.repository.find({ order: { name: "ASC" } });
  }

  async findById(id: string): Promise<Supplier | null> {
    return this.repository.findOneBy({ id });
  }

  async create(data: Partial<Supplier>): Promise<Supplier> {
    const entity = this.repository.create(data);
    return this.repository.save(entity);
  }

  async findByName(name: string): Promise<Supplier | null> {
    return this.repository.findOneBy({ name });
  }

  async count(): Promise<number> {
    return this.repository.count();
  }
}
