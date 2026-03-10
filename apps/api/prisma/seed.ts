import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@foundteach.com';
  const password = process.env.ADMIN_PASSWORD || 'FoundTeach2026!';
  const firstName = 'Admin';
  const lastName = 'FoundTeach';

  console.log('🌱 Iniciando seeding...');

  // Verificar si ya existe un admin
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (existingAdmin) {
    console.log('⚠️ El usuario administrador ya existe.');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: Role.ADMIN,
    },
  });

  console.log(`✅ Administrador creado con éxito: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
