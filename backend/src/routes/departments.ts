import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();
import { prisma } from '../lib/prisma';

// Get all departments
router.get('/', async (req: Request, res: Response) => {
    try {
        const departments = await prisma.department.findMany({
            include: {
                _count: {
                    select: { issues: true, projects: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(departments);
    } catch (error) {
        console.error('Error fetching departments:', error);
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

// Create a department (Admin only)
router.post('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Unauthorized: Only Admins can create departments' });
            return;
        }

        const { name, description, logoUrl } = req.body;

        if (!name) {
            res.status(400).json({ error: 'Department name is required' });
            return;
        }

        // Check if department already exists
        const existingDepartment = await prisma.department.findUnique({ where: { name } });
        if (existingDepartment) {
            res.status(400).json({ error: 'Department with this name already exists' });
            return;
        }

        const department = await prisma.department.create({
            data: {
                name,
                description,
                logoUrl
            }
        });

        res.status(201).json(department);
    } catch (error) {
        console.error('Error creating department:', error);
        res.status(500).json({ error: 'Failed to create department' });
    }
});

// Delete a department (Admin only)
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user || user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Unauthorized: Only Admins can delete departments' });
            return;
        }

        const { id } = req.params;

        // Ensure department exists
        const department = await prisma.department.findUnique({ where: { id } });
        if (!department) {
            res.status(404).json({ error: 'Department not found' });
            return;
        }

        await prisma.department.delete({ where: { id } });

        res.json({ message: 'Department deleted successfully' });
    } catch (error: any) {
        if (error.code === 'P2003') {
            res.status(400).json({ 
                error: 'Cannot delete department: It is currently assigned to one or more issues or projects. Please reassign those items before deleting.' 
            });
            return;
        }
        console.error('Error deleting department:', error);
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

export default router;
