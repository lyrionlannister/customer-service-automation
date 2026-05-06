import { Repository } from "typeorm";
import { RepairNote } from "../entities/repair-note.entity.js";
import { BaseDao } from "../../daos/base.dao.js";

export class RepairNoteDao extends BaseDao<RepairNote> {
  constructor(repository: Repository<RepairNote>) {
    super(repository);
  }

  async findAllOrdered(): Promise<RepairNote[]> {
    return this.repository.find({ order: { controlNumber: "DESC" } });
  }

  async findByControlNumber(controlNumber: number): Promise<RepairNote | null> {
    return this.repository.findOneBy({ controlNumber });
  }
}
