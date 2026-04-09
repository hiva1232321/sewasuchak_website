
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all projects
router.get('/', async (req: Request, res: Response) => {
    try {
        const { status, department } = req.query;
        const where: any = {};

        if (status) where.status = status;
        if (department) {
            where.department = {
                name: department
            };
        }

        const projects = await prisma.project.findMany({
            where,
            include: {
                department: true,
                _count: {
                    select: { updates: true }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Get single project details
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const project = await prisma.project.findUnique({
            where: { id },
            include: {
                department: true,
                updates: {
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!project) {
            res.status(404).json({ error: 'Project not found' });
            return;
        }

        res.json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ error: 'Failed to fetch project details' });
    }
});

// Create project (Admin/Official)
// In a real app, this would have auth middleware
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, description, budget, startDate, departmentId, latitude, longitude, address } = req.body;

        const project = await prisma.project.create({
            data: {
                title,
                description,
                budget: parseFloat(budget),
                startDate: new Date(startDate),
                departmentId,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null,
                address,
                status: 'PLANNED'
            }
        });

        res.status(201).json(project);
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});

// Add update to project
router.post('/:id/updates', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, imageUrl, spentAmount, status } = req.body;

        const update = await prisma.projectUpdate.create({
            data: {
                title,
                description,
                imageUrl,
                projectId: id
            }
        });

        const projectData: any = { updatedAt: new Date() };
        if (spentAmount !== undefined) projectData.spentAmount = { increment: parseFloat(spentAmount) };
        if (status) projectData.status = status;

        // Update project spentAmount if provided in body or just update timestamp
        await prisma.project.update({
            where: { id },
            data: projectData
        });

        res.status(201).json(update);
    } catch (error) {
        console.error('Error adding update:', error);
        res.status(500).json({ error: 'Failed to add project update' });
    }
});

export default router;
