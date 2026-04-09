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
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import departmentRoutes from './routes/departments';
app.use('/issues', issueRoutes);
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/departments', departmentRoutes);

// Seed initial data (for development)
const seedInitialData = async () => {
    // Seed User
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

    // Seed Departments
    const deptCount = await prisma.department.count();
    if (deptCount === 0) {
        const roadDept = await prisma.department.create({
            data: {
                name: 'Department of Roads',
                description: 'Responsible for construction and maintenance of national highways.',
                logoUrl: 'https://img.icons8.com/isometric/512/road.png'
            }
        });
        const waterDept = await prisma.department.create({
            data: {
                name: 'Department of Water Supply',
                description: 'Managing water resources and distribution systems.',
                logoUrl: 'https://img.icons8.com/isometric/512/water.png'
            }
        });
        const electricityDept = await prisma.department.create({
            data: {
                name: 'NEA (Nepal Electricity Authority)',
                description: 'State-owned generator and distributor of electric power.',
                logoUrl: 'https://img.icons8.com/isometric/512/electricity.png'
            }
        });

        console.log('Departments seeded');

        // Seed Projects
        const projectCount = await prisma.project.count();
        if (projectCount === 0) {
            const project1 = await prisma.project.create({
                data: {
                    title: 'Kathmandu-Terai Fast Track',
                    description: 'A mega-infrastructure project connecting Kathmandu with the southern plains.',
                    budget: 175000000000, // 175 Billion NPR
                    spentAmount: 45000000000,
                    startDate: new Date('2017-08-01'),
                    status: 'ONGOING',
                    departmentId: roadDept.id,
                    address: 'Kathmandu - Nijgadh'
                }
            });

            await prisma.projectUpdate.create({
                data: {
                    projectId: project1.id,
                    title: 'Tunnelling Progress',
                    description: 'Work on the main tunnel at Mohari is 75% complete.',
                    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19480c5?auto=format&fit=crop&q=80&w=1000'
                }
            });

            const project2 = await prisma.project.create({
                data: {
                    title: 'Melamchi Water Supply Project - Phase 2',
                    description: 'Second phase to increase water supply capacity to Kathmandu Valley.',
                    budget: 25000000000,
                    spentAmount: 2000000000,
                    startDate: new Date('2023-01-15'),
                    status: 'ONGOING',
                    departmentId: waterDept.id,
                    address: 'Melamchi, Sindhupalchok'
                }
            });

            await prisma.projectUpdate.create({
                data: {
                    projectId: project2.id,
                    title: 'Intake Rehabilitation',
                    description: 'Rehabilitation of the intake damaged by floods has started.',
                    imageUrl: 'https://images.unsplash.com/photo-1517089531940-da218eb4b237?auto=format&fit=crop&q=80&w=1000'
                }
            });

            console.log('Projects and updates seeded');
        }
    }
};
seedInitialData();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
