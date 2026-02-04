
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// Configure Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Ensure absolute path or strictly relative to CWD
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Get all issues
router.get('/', async (req: Request, res: Response) => {
    try {
        const { priority } = req.query;

        const whereClause: any = {};
        if (priority) {
            whereClause.priority = priority as string;
        }

        const issues = await prisma.issue.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: { votes: true }
                }
            }
        });
        res.json(issues);
    } catch (error) {
        console.error('Error fetching issues:', error);
        res.status(500).json({ error: 'Failed to fetch issues' });
    }
});

// Get single issue
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const issue = await prisma.issue.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        name: true,
                        email: true
                    }
                },
                comments: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                },
                _count: {
                    select: { votes: true }
                },
                media: true // Include media
            }
        });

        if (!issue) {
            res.status(404).json({ error: 'Issue not found' });
            return;
        }

        res.json(issue);
    } catch (error) {
        console.error('Error fetching issue:', error);
        res.status(500).json({ error: 'Failed to fetch issue' });
    }
});

// Create new issue with multiple file support
router.post('/', upload.array('media', 5), async (req: Request, res: Response): Promise<void> => {
    console.log("POST /issues received");
    try {
        const { type, description, authorId, title } = req.body;

        // Parse location if it comes as string from FormData
        let location = req.body.location;
        if (typeof location === 'string') {
            try {
                location = JSON.parse(location);
            } catch (e) {
                console.error("Failed to parse location JSON", e);
                res.status(400).json({ error: 'Invalid location format' });
                return;
            }
        }

        // Basic validation
        if (!type || !description || !location) {
            console.log("Missing required fields", { type, description, location });
            res.status(400).json({ error: 'Missing required fields' });
            return;
        }

        // Reverse Geocoding
        let address = "Location unavailable";
        try {
            if (location.lat && location.lng) {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}`, {
                    headers: {
                        'User-Agent': 'CivicConnect/1.0'
                    }
                });
                if (geoRes.ok) {
                    const geoData = await geoRes.json();
                    address = geoData.display_name || "Location unavailable";
                    // Try to shorten address for UI
                    const parts = address.split(', ');
                    if (parts.length > 2) {
                        address = `${parts[0]}, ${parts[1]}, ${parts[parts.length - 1]}`;
                    }
                }
            }
        } catch (error) {
            console.error("Geocoding failed", error);
        }

        let imageUrl: string | null = null;
        let videoUrl: string | null = null;
        const mediaData: { url: string; type: string }[] = [];

        // Cast to any to access files, or use proper Multer types if available globally
        const files = (req as any).files as Express.Multer.File[];

        if (files && Array.isArray(files)) {
            files.forEach(file => {
                const fileUrl = `/uploads/${file.filename}`;
                const fileType = file.mimetype.startsWith('video/') ? 'VIDEO' : 'IMAGE';

                mediaData.push({
                    url: fileUrl,
                    type: fileType
                });

                // Set legacy/thumbnail fields (first found wins)
                if (fileType === 'VIDEO' && !videoUrl) videoUrl = fileUrl;
                if (fileType === 'IMAGE' && !imageUrl) imageUrl = fileUrl;
            });
        }

        const issue = await prisma.issue.create({
            data: {
                title: title || `${type} Issue`,
                description,
                category: type,
                latitude: typeof location.lat === 'number' ? location.lat : parseFloat(location.lat),
                longitude: typeof location.lng === 'number' ? location.lng : parseFloat(location.lng),
                address: address,
                authorId: authorId || (await prisma.user.findFirst())?.id || "temp-user-id",
                status: 'OPEN',
                priority: 'NORMAL',
                imageUrl,
                videoUrl,
                media: {
                    create: mediaData
                }
            }
        });

        console.log("Issue created successfully:", issue.id);
        res.status(201).json(issue);
    } catch (error) {
        console.error('Error creating issue:', error);
        res.status(500).json({
            error: 'Failed to create issue',
            details: error instanceof Error ? error.message : String(error)
        });
    }
});

// Vote on an issue
router.post('/:id/vote', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // Optional: pass userId if avail, else default

        // For MVP without auth, pick the first user or a specific test user
        const user = await prisma.user.findFirst();

        if (!user) {
            res.status(400).json({ error: 'No user found to vote' });
            return;
        }

        const actualUserId = userId || user.id;

        // Check if vote exists
        const existingVote = await prisma.vote.findUnique({
            where: {
                userId_issueId: {
                    userId: actualUserId,
                    issueId: id
                }
            }
        });

        if (existingVote) {
            // Remove vote (toggle off)
            await prisma.vote.delete({
                where: {
                    userId_issueId: {
                        userId: actualUserId,
                        issueId: id
                    }
                }
            });
        } else {
            // Add vote
            await prisma.vote.create({
                data: {
                    userId: actualUserId,
                    issueId: id
                }
            });
        }

        // Get updated count
        const updatedIssue = await prisma.issue.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { votes: true }
                }
            }
        });

        res.json({ votes: updatedIssue?._count.votes || 0, hasVoted: !existingVote });

    } catch (error) {
        console.error('Error voting:', error);
        res.status(500).json({ error: 'Failed to vote' });
    }
});

export default router;
