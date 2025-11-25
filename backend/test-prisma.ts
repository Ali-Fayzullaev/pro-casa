import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgresql://pro_casa_user:pro_casa_dev_password@localhost:5432/pro_casa_db?schema=public',
    },
  },
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('Testing Prisma connection...');
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@casa.kz' },
    });
    console.log('✅ User found:', user ? `${user.firstName} ${user.lastName}` : 'NOT FOUND');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
