import { CashSessionDao } from "../daos/cash-session.dao.js";
import { CashMovementDao } from "../daos/cash-movement.dao.js";
import { LocalService } from "../../../app_platform/local/services/local.service.js";
import { CashSession } from "../entities/cash-session.entity.js";
import { CashMovement, CashMovementMethod, CashMovementRelatedEntityType, CashMovementType } from "../entities/cash-movement.entity.js";
import { roundCashAmount } from "../utils/round-cash-amount.js";

export interface RegisterCashMovementInput {
  cashSessionId: string;
  type: CashMovementType;
  method: CashMovementMethod;
  amount: number;
  note?: string | null;
  relatedEntityType?: CashMovementRelatedEntityType;
  relatedEntityId?: string | null;
  createdByEmployeeId?: string | null;
}

export interface CashSummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  byMethod: Record<CashMovementMethod, { income: number; expense: number }>;
}

export class CashService {
  constructor(
    private sessionDao: CashSessionDao,
    private movementDao: CashMovementDao,
    private localService: LocalService,
  ) {}

  async getAllSessions(): Promise<CashSession[]> {
    return this.sessionDao.findAllOrdered();
  }

  async getSessionById(id: string): Promise<CashSession | null> {
    return this.sessionDao.findById(id);
  }

  async getOpenSession(localId: string): Promise<CashSession | null> {
    return this.sessionDao.findOpenByLocal(localId);
  }

  async openSession(
    localId: string,
    openingBalance: number,
    openedByEmployeeId?: string | null,
  ): Promise<CashSession> {
    const existing = await this.sessionDao.findOpenByLocal(localId);
    if (existing) {
      throw new Error("Ya hay una sesión de caja abierta para este local");
    }
    return this.sessionDao.create({
      localId,
      openingBalance,
      openedByEmployeeId: openedByEmployeeId ?? null,
      status: "open",
    } as Partial<CashSession>);
  }

  async closeSession(id: string, closingBalance: number): Promise<CashSession> {
    const session = await this.sessionDao.findById(id);
    if (!session) throw new Error("Sesión de caja no encontrada");
    if (session.status === "closed") throw new Error("La sesión ya está cerrada");

    const updated = await this.sessionDao.update(id, {
      status: "closed",
      closingBalance,
      closedAt: new Date(),
    } as Partial<CashSession>);
    return updated as CashSession;
  }

  // El redondeo solo se aplica en efectivo -- tarjeta/transferencia siempre
  // liquidan el monto exacto. El monto ya redondeado es lo que se persiste,
  // para que el total de la sesion siempre cuadre con la suma registrada.
  async registerMovement(input: RegisterCashMovementInput): Promise<CashMovement> {
    const session = await this.sessionDao.findById(input.cashSessionId);
    if (!session) throw new Error("Sesión de caja no encontrada");
    if (session.status !== "open") {
      throw new Error("No se pueden registrar movimientos en una sesión cerrada");
    }

    let amount = input.amount;
    if (input.method === "efectivo") {
      const local = await this.localService.getConfig();
      amount = roundCashAmount(amount, Number(local.cashRoundingUnit));
    }

    return this.movementDao.create({
      cashSessionId: input.cashSessionId,
      type: input.type,
      method: input.method,
      amount,
      note: input.note ?? null,
      relatedEntityType: input.relatedEntityType ?? "manual",
      relatedEntityId: input.relatedEntityId ?? null,
      createdByEmployeeId: input.createdByEmployeeId ?? null,
    } as Partial<CashMovement>);
  }

  async getMovements(cashSessionId: string): Promise<CashMovement[]> {
    return this.movementDao.findBySession(cashSessionId);
  }

  async getSummary(cashSessionId: string): Promise<CashSummary> {
    const movements = await this.movementDao.findBySession(cashSessionId);
    const byMethod: CashSummary["byMethod"] = {
      efectivo: { income: 0, expense: 0 },
      tarjeta: { income: 0, expense: 0 },
      transferencia: { income: 0, expense: 0 },
    };
    let totalIncome = 0;
    let totalExpense = 0;

    for (const movement of movements) {
      const amount = Number(movement.amount);
      if (movement.type === "income") {
        totalIncome += amount;
        byMethod[movement.method].income += amount;
      } else {
        totalExpense += amount;
        byMethod[movement.method].expense += amount;
      }
    }

    return { totalIncome, totalExpense, net: totalIncome - totalExpense, byMethod };
  }
}
