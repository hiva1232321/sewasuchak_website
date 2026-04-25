
import { Router, Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Middleware to ensure user is Admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.userId) {
            console.error('[ADMIN] No userId found in request');
            return res.status(401).json({ error: 'Authentication required' });
        }

        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        
        if (!user) {
            console.error(`[ADMIN] User with ID ${req.userId} not found`);
            return res.status(403).json({ error: 'Unauthorized: User not found' });
        }

        if (user.role !== 'ADMIN') {
            console.warn(`[ADMIN] Access denied for user ${user.email} with role ${user.role}`);
            return res.status(403).json({ error: 'Unauthorized: Admin access required' });
        }

        console.log(`[ADMIN] Access granted to ${user.email}`);
        next();
    } catch (error) {
        console.error('[ADMIN] Error in isAdmin middleware:', error);
        res.status(500).json({ error: 'Internal server error during authorization' });
    }
};

// ==================== DASHBOARD STATS ====================
router.get('/stats', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    try {
        console.log('[ADMIN] Fetching dashboard stats...');
        const [users, issues, departments, projects] = await Promise.all([
            prisma.user.count(),
            prisma.issue.count(),
            prisma.department.count(),
            prisma.project.count()
        ]);

        console.log('[ADMIN] Stats fetched:', { users, issues, departments, projects });
        res.json({ users, issues, departments, projects });
    } catch (error) {
        console.error('[ADMIN] Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// ==================== USER MANAGEMENT ====================
router.get('/users', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isVerified: true,
                createdAt: true,
                _count: { select: { issues: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.delete('/users/:id', authMiddleware, isAdmin, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    console.log(`[ADMIN] Request to delete user: ${id}`);
    try {
        if (id === req.userId) {
            res.status(400).json({ error: 'Cannot delete your own admin account' });
            return;
        }

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Delete all related records to satisfy foreign key constraints
        const userIssues = await prisma.issue.findMany({ where: { authorId: id }, select: { id: true } });
        const issueIds = userIssues.map(i => i.id);

        // 1. Delete all votes, comments, and media on the user's issues
        await prisma.vote.deleteMany({ where: { issueId: { in: issueIds } } });
        await prisma.comment.deleteMany({ where: { issueId: { in: issueIds } } });
        await prisma.media.deleteMany({ where: { issueId: { in: issueIds } } });

        // 2. Delete the user's issues themselves
        await prisma.issue.deleteMany({ where: { authorId: id } });

        // 3. Delete the user's own votes and comments on other issues
        await prisma.vote.deleteMany({ where: { userId: id } });
        await prisma.comment.deleteMany({ where: { userId: id } });

        // 4. Finally delete the user
        await prisma.user.delete({ where: { id } });
        
        res.json({ message: 'User and all their related data deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ==================== ISSUE MANAGEMENT ====================
router.get('/issues', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    try {
        const issues = await prisma.issue.findMany({
            include: {
                author: { select: { name: true, email: true } },
                department: { select: { name: true } },
                _count: { select: { votes: true, comments: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(issues);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
});

router.delete('/issues/:id', authMiddleware, isAdmin, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    console.log(`[ADMIN] Request to delete issue: ${id}`);
    try {
        
        await prisma.vote.deleteMany({ where: { issueId: id } });
        await prisma.comment.deleteMany({ where: { issueId: id } });
        await prisma.media.deleteMany({ where: { issueId: id } });
        await prisma.issue.delete({ where: { id } });

        res.json({ message: 'Issue deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete issue' });
    }
});

// ==================== PROJECT MANAGEMENT ====================
router.get('/projects', authMiddleware, isAdmin, async (req: Request, res: Response) => {
    try {
        const projects = await prisma.project.findMany({
            include: {
                department: { select: { name: true } },
                _count: { select: { updates: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

router.delete('/projects/:id', authMiddleware, isAdmin, async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    console.log(`[ADMIN] Request to delete project: ${id}`);
    try {
        await prisma.projectUpdate.deleteMany({ where: { projectId: id } });
        await prisma.project.delete({ where: { id } });
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});


// ==================== GLOBAL WIPE ====================
router.post('/wipe-database', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'ADMIN') {
            res.status(403).json({ error: 'Unauthorized: Only Admins can perform this action' });
            return;
        }

        console.log(`[DANGER] Wipe Database initiated by ${user.email}`);
        
        await prisma.media.deleteMany({});
        await prisma.vote.deleteMany({});
        await prisma.comment.deleteMany({});
        await prisma.projectUpdate.deleteMany({});
        await prisma.project.deleteMany({});
        await prisma.issue.deleteMany({});
        await prisma.department.deleteMany({});
        await prisma.otp.deleteMany({});
        
        await prisma.user.deleteMany({
            where: { id: { not: userId } }
        });

        res.json({ message: 'Database wiped successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to wipe database' });
    }
});

export default router;
