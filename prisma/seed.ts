import { PrismaClient, Role, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Cek apakah super admin sudah ada
  const existingAdmin = await prisma.employee.findFirst({
    where: { email: 'superadmin@example.com' },
  });

  if (existingAdmin) {
    console.log('Super Admin already exists. Skipping seed.');
    return;
  }

  // Hash password
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('superadmin123', salt);

  // Buat super admin
  const superAdmin = await prisma.employee.create({
    data: {
      fullName: 'System Super Admin',
      email: 'superadmin@example.com',
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      birthDate: new Date('1990-01-01'),
      gender: Gender.MALE,
      nationality: 'System',
      passportNumber: 'SYS-0000',
      isActive: true,
    },
  });

  console.log(`Super Admin created successfully with email: ${superAdmin.email} and password: superadmin123`);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
