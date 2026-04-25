
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.update({
        where: { email: 'shivamatangulu41@gmail.com' },
        data: { password: hashedPassword, role: 'ADMIN', isVerified: true }
    });
    console.log('User updated:', user.email);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
