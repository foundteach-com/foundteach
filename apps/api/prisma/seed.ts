import { PrismaClient, Role, RdvLifeStage } from '@prisma/client';
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
  } else {
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

  // ─── Rutas de Vida: Decisiones Iniciales ───
  await seedRdv();
}

async function seedRdv() {
  console.log('🌱 Creando decisiones de Rutas de Vida (Primera Infancia)...');

  const count = await prisma.rdvDecision.count({
    where: { etapa: RdvLifeStage.EARLY_CHILDHOOD },
  });

  if (count > 0) {
    console.log('⚠️ Las decisiones de la Primera Infancia ya existen.');
    return;
  }

  // Decisión 1: El Juguete
  await prisma.rdvDecision.create({
    data: {
      etapa: RdvLifeStage.EARLY_CHILDHOOD,
      titulo: 'El Juguete Compartido',
      descripcion: 'Estás en el parque de juegos y otro niño se acerca llorando porque quiere el carrito de bomberos con el que estás jugando. Tu madre te mira esperando tu reacción.',
      sortOrder: 1,
      options: {
        create: [
          {
            texto: 'Prestarle el carrito con una sonrisa',
            cambiosEnAtributos: { social: 5, etico: 3, afectivo: 2 },
            cambiosEnContexto: { amigos: 5, familia: 2 },
            cambiosEnRelaciones: { MADRE: 3 },
            sortOrder: 1,
          },
          {
            texto: 'Aferrarte al carrito y gritar "¡Mío!"',
            cambiosEnAtributos: { fisico: 2, social: -3, etico: -2, afectivo: -2 },
            cambiosEnContexto: { amigos: -3 },
            cambiosEnRelaciones: { MADRE: -2 },
            sortOrder: 2,
          },
          {
            texto: 'Ignorar al niño y seguir jugando de espaldas',
            cambiosEnAtributos: { cognitivo: 2, social: -2, comunicativo: -2 },
            cambiosEnContexto: { amigos: -1 },
            cambiosEnRelaciones: {},
            sortOrder: 3,
          }
        ]
      }
    }
  });

  // Decisión 2: La Comida
  await prisma.rdvDecision.create({
    data: {
      etapa: RdvLifeStage.EARLY_CHILDHOOD,
      titulo: 'Descubriendo Nuevos Sabores',
      descripcion: 'A la hora de cenar, tu padre pone frente a ti un plato con un puré de color verde brillante que nunca habías visto. Tiene un olor extraño.',
      sortOrder: 2,
      options: {
        create: [
          {
            texto: 'Probar una cucharada con curiosidad',
            cambiosEnAtributos: { cognitivo: 4, fisico: 3 },
            cambiosEnContexto: { familia: 3 },
            cambiosEnRelaciones: { PADRE: 4 },
            sortOrder: 1,
          },
          {
            texto: 'Tirar el plato al suelo en señal de protesta',
            cambiosEnAtributos: { fisico: 1, afectivo: -3, comunicativo: -2 },
            cambiosEnContexto: { familia: -4 },
            cambiosEnRelaciones: { PADRE: -5 },
            sortOrder: 2,
          },
          {
            texto: 'Señalar tu boca y hacer sonidos pidiendo que te den de comer',
            cambiosEnAtributos: { comunicativo: 5, afectivo: 2 },
            cambiosEnContexto: { familia: 2 },
            cambiosEnRelaciones: { PADRE: 2 },
            sortOrder: 3,
          }
        ]
      }
    }
  });

  console.log('✅ Decisiones de Primera Infancia creadas con éxito.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
