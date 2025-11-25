import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting database seed...');

  // Хешировать пароль
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // Создать администратора
  const admin = await prisma.user.upsert({
    where: { email: 'admin@casa.kz' },
    update: {},
    create: {
      email: 'admin@casa.kz',
      password: hashedPassword,
      role: 'ADMIN',
      firstName: 'Администратор',
      lastName: 'Casa',
      phone: '+77001234567',
    },
  });

  console.log('✅ Admin created:', admin.email);

  // Создать тестового брокера
  const broker = await prisma.user.upsert({
    where: { email: 'broker@casa.kz' },
    update: {},
    create: {
      email: 'broker@casa.kz',
      password: await bcrypt.hash('broker123', 10),
      role: 'BROKER',
      firstName: 'Иван',
      lastName: 'Иванов',
      phone: '+77001234568',
    },
  });

  console.log('✅ Broker created:', broker.email);

  // Создать тестового застройщика
  const developer = await prisma.user.upsert({
    where: { email: 'developer@casa.kz' },
    update: {},
    create: {
      email: 'developer@casa.kz',
      password: await bcrypt.hash('developer123', 10),
      role: 'DEVELOPER',
      firstName: 'Петр',
      lastName: 'Петров',
      phone: '+77001234569',
    },
  });

  console.log('✅ Developer created:', developer.email);
  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@casa.kz / admin123');
  console.log('Broker: broker@casa.kz / broker123');
  console.log('Developer: developer@casa.kz / developer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
