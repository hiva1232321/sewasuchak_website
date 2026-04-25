
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.count();
    const issues = await prisma.issue.count();
    const departments = await prisma.department.count();
    const projects = await prisma.project.count();
    console.log('Database Counts:', { users, issues, departments, projects });
    
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    console.log('Admin User:', adminUser);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
