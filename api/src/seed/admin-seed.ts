import { hash } from "bcryptjs";
import { Repository } from "typeorm";
import { User } from "../auth/entities/user.entity.js";

export async function seedAdminUser(userRepository: Repository<User>): Promise<void> {
  const count = await userRepository.count();
  if (count > 0) return;

  const firstName = process.env.ADMIN_FIRST_NAME;
  const lastName = process.env.ADMIN_LAST_NAME;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!firstName || !lastName || !email || !password) {
    console.warn("Seed de administrador omitido: faltan variables ADMIN_* en el entorno.");
    return;
  }

  const hashedPassword = await hash(password, 10);

  await userRepository.save(
    userRepository.create({ firstName, lastName, email, password: hashedPassword }),
  );

  console.log(`Usuario administrador creado: ${email}`);
}
