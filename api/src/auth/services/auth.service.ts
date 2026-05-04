import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserDao } from "../daos/user.dao.js";
import { RegisterUserDto } from "../dtos/register-user.dto.js";
import { LoginUserDto } from "../dtos/login-user.dto.js";
import { User } from "../entities/user.entity.js";

const { sign } = jwt;

export class AuthService {
  constructor(private userDao: UserDao) {}

  async register(data: RegisterUserDto): Promise<User> {
    // Verificar si el email ya existe
    const existingUser = await this.userDao.findByEmail(data.email);
    if (existingUser) {
      throw new Error("Email ya registrado");
    }

    // Hashear la contraseña
    const hashedPassword = await hash(data.password, 10);

    // Crear nuevo usuario
    const newUser = await this.userDao.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
    });

    return newUser;
  }

  async getAllUsers(): Promise<Omit<User, "password">[]> {
    const users = await this.userDao.findAll();
    return users.map(({ password, ...rest }) => rest);
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
    // Buscar usuario por email
    const user = await this.userDao.findByEmail(data.email);
    if (!user) {
      throw new Error("Email no registrado");
    }

    // Verificar contraseña
    const isPasswordValid = await compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new Error("Contraseña invalida");
    }

    // Generar JWT
    const token = sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    // Retornar usuario sin contraseña
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }
}
