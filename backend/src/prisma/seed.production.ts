import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding production database...');

  // Очищаем существующие данные
  await prisma.booking.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.project.deleteMany();
  await prisma.client.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // Создаем только администратора
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@casa.kz',
      password: hashedPassword,
      firstName: 'Администратор',
      lastName: 'Системы',
      role: 'ADMIN',
      phone: '+77001234567',
    },
  });

  console.log('✅ Created admin user');
  console.log('📧 Email: admin@casa.kz');
  console.log('🔑 Password: admin123');
  console.log('');
  console.log('⚠️  ВАЖНО: Смените пароль администратора после первого входа!');
  console.log('');
  console.log('🎉 Production database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
