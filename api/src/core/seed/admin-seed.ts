import { hash } from "bcryptjs";
import { Repository } from "typeorm";
import { User } from "../../identity/auth/entities/user.entity.js";
import { Tenant } from "../tenancy/entities/tenant.entity.js";
import { allowSystemScope, runWithTenant } from "../tenancy/tenant-context.js";

export async function seedAdminUser(
  userRepository: Repository<User>,
  tenantRepository: Repository<Tenant>,
): Promise<void> {
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

  const tenant = await allowSystemScope(() =>
    tenantRepository.save(tenantRepository.create({ name: `${firstName} ${lastName}` })),
  );

  await runWithTenant(tenant.id, async () => {
    const hashedPassword = await hash(password, 10);

    await userRepository.save(
      userRepository.create({
        tenantId: tenant.id,
        role: "owner",
        firstName,
        lastName,
        email,
        password: hashedPassword,
      }),
    );
  });

  console.log(`Usuario administrador creado: ${email}`);
}
