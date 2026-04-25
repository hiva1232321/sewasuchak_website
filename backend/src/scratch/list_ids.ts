
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({ take: 5 });
    console.log('Users:', users.map(u => ({ id: u.id, email: u.email, role: u.role })));
    
    const issues = await prisma.issue.findMany({ take: 5 });
    console.log('Issues:', issues.map(i => ({ id: i.id, title: i.title })));
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
