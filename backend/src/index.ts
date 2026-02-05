import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/', (req, res) => {
    res.send('Sewasuchak API is running');
});

app.use('/uploads', express.static('uploads'));

app.get('/stats', async (req, res) => {
    try {
        const totalReports = await prisma.issue.count();
        const resolvedIssues = await prisma.issue.count({ where: { status: 'RESOLVED' } });

        const resolvedItems = await prisma.issue.findMany({
            where: { status: 'RESOLVED' },
            select: { createdAt: true, updatedAt: true }
        });

        let avgTime = "12hrs"; // Default fallback
        if (resolvedItems.length > 0) {
            const totalTimeMs = resolvedItems.reduce((acc, curr) => {
                return acc + (new Date(curr.updatedAt).getTime() - new Date(curr.createdAt).getTime());
            }, 0);
            const avgMs = totalTimeMs / resolvedItems.length;
            const hours = Math.round(avgMs / (1000 * 60 * 60));

            if (hours < 1) {
                avgTime = "< 1hr";
            } else if (hours < 24) {
                avgTime = `${hours}hrs`;
            } else {
                avgTime = `${Math.round(hours / 24)}days`;
            }
        }

        res.json({
            totalReports,
            resolvedIssues,
            avgResponseTime: avgTime
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch stats" });
    }
});

import issueRoutes from './routes/issues';
app.use('/issues', issueRoutes);

// Seed a default user if none exists (for development)
const seedDefaultUser = async () => {
    const userCount = await prisma.user.count();
    if (userCount === 0) {
        await prisma.user.create({
            data: {
                email: 'citizen@example.com',
                name: 'John Doe',
                role: 'CITIZEN',
                password: 'password123'
            }
        });
        console.log('Default user created');
    }
};
seedDefaultUser();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
