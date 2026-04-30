import { Repository } from "typeorm";
import { User } from "../entities/user.entity.js";
import { BaseDao } from "./base.dao.js";

export class UserDao extends BaseDao<User> {
  constructor(repository: Repository<User>) {
    super(repository);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ email } as Partial<User>);
  }
}
