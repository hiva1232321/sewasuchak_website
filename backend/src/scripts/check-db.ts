
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const issues = await prisma.issue.findMany();
    console.log('Issues found:', issues.length);
    issues.forEach(issue => {
        console.log(`ID: ${issue.id}, Title: ${issue.title}, ImageUrl: ${issue.imageUrl}`);
    });
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
