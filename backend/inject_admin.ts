import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    // Create or update admin user
    const admin = await prisma.user.upsert({
        where: { email: 'shivamatangulu41@gmail.com' },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true
        },
        create: {
            name: 'Shiva Matangulu',
            email: 'shivamatangulu41@gmail.com',
            phone: '9800000000',
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true
        }
    });

    console.log("Admin credentials updated:");
    console.log(`Email: ${admin.email}`);
    console.log(`Password: admin123`);
    console.log(`Role: ${admin.role}`);
    console.log(`Verified: ${admin.isVerified}`);

}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  });
