import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { Repository } from "typeorm";
import { UserDao } from "../daos/user.dao.js";
import { RegisterUserDto } from "../dtos/register-user.dto.js";
import { LoginUserDto } from "../dtos/login-user.dto.js";
import { CreateEmployeeDto } from "../dtos/create-employee.dto.js";
import { User } from "../entities/user.entity.js";
import { Tenant } from "../../tenancy/entities/tenant.entity.js";
import { requireJwtSecret } from "../jwt-secret.js";
import { allowSystemScope, runWithTenant } from "../../tenancy/tenant-context.js";

const { sign } = jwt;

export class AuthService {
  constructor(
    private userDao: UserDao,
    private tenantRepository: Repository<Tenant>,
  ) {}

  async register(data: RegisterUserDto): Promise<User> {
    // No hay tenant en contexto todavia (quien registra no tiene uno):
    // crear el Tenant corre en scope de sistema, explicito.
    const tenant = await allowSystemScope(() =>
      this.tenantRepository.save(this.tenantRepository.create({ name: data.email })),
    );

    // Dentro del tenant recien creado, validar duplicados y crear el owner.
    // No esta envuelto en una transaccion de DB: si el insert del usuario
    // fallara, queda un Tenant huerfano sin dueno (basura inocua, no un
    // problema de integridad de datos como el de numero_control).
    return runWithTenant(tenant.id, async () => {
      const existingUser = await this.userDao.findByEmail(data.email);
      if (existingUser) {
        throw new Error("Email ya registrado");
      }

      const hashedPassword = await hash(data.password, 10);

      return this.userDao.create({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: hashedPassword,
        role: "owner",
      });
    });
  }

  async getAllUsers(): Promise<Omit<User, "password">[]> {
    const users = await this.userDao.findAll();
    return users.map(({ password, ...rest }) => rest);
  }

  // Empleado nuevo dentro del tenant ya resuelto por tenantMiddleware -- a
  // diferencia de register(), nunca crea un Tenant.
  async createEmployee(data: CreateEmployeeDto): Promise<Omit<User, "password">> {
    const existingUser = await this.userDao.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email ya registrado");
    }

    const hashedPassword = await hash(data.password, 10);

    const user = await this.userDao.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      role: data.role ?? "employee",
      salaryAmount: data.salaryAmount ?? null,
      payCycle: data.payCycle ?? null,
    });

    const { password, ...rest } = user;
    return rest;
  }

  // Listado ligero para poblar los <Select> de empleado en otros modulos.
  async listEmployees(): Promise<Pick<User, "id" | "firstName" | "lastName" | "role">[]> {
    const users = await this.userDao.findAll();
    return users.map(({ id, firstName, lastName, role }) => ({ id, firstName, lastName, role }));
  }

  // Resolver nombre de un empleado puntual (p.ej. para el PDF de una nota).
  async getEmployeeName(id: string): Promise<string | null> {
    const user = await this.userDao.findById(id);
    return user ? `${user.firstName} ${user.lastName}`.trim() : null;
  }

  async toggleUserStatus(id: string): Promise<Omit<User, "password"> | null> {
    const user = await this.userDao.toggleStatus(id);
    if (!user) return null;
    const { password, ...rest } = user;
    return rest;
  }

  async login(
    data: LoginUserDto,
  ): Promise<{ user: Omit<User, "password">; token: string }> {
    // findByEmail necesita tenant en contexto, pero en login todavia no se
    // sabe el tenant del usuario: se busca en scope de sistema por email
    // (unico campo sin ambiguedad antes de autenticar) y luego se re-entra
    // al tenant real para el resto de la operacion.
    const user = await allowSystemScope(() =>
      this.userDao.findByEmailAcrossTenants(data.email),
    );
    if (!user) {
      throw new Error("Email no registrado");
    }

    return runWithTenant(user.tenantId, async () => {
      const isPasswordValid = await compare(data.password, user.password);
      if (!isPasswordValid) {
        throw new Error("Contraseña invalida");
      }

      if (!user.isActive) {
        throw new Error("Usuario inactivo");
      }

      const token = sign(
        { id: user.id, email: user.email, tenantId: user.tenantId, role: user.role },
        requireJwtSecret(),
        { expiresIn: "24h" },
      );

      const { password, ...userWithoutPassword } = user;

      return { user: userWithoutPassword, token };
    });
  }
}
