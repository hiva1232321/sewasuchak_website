
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { authMiddleware } from '../middleware/authMiddleware';

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

// Check for nearby issues (Duplicate Detection)
router.get('/nearby', async (req: Request, res: Response) => {
    try {
        const { lat, lng, radius = 10, category } = req.query;
        console.log(`[API] /nearby requested: lat=${lat}, lng=${lng}, radius=${radius}, category=${category}`);

        if (!lat || !lng) {
            console.log("[API] /nearby missing lat/lng");
            res.status(400).json({ error: 'Latitude and Longitude are required' });
            return;
        }

        const userLat = parseFloat(lat as string);
        const userLng = parseFloat(lng as string);
        const searchRadius = parseFloat(radius as string); // in meters

        // Calculate Bounding Box (approximate)
        // 1 degree lat ~= 111.32 km = 111320 meters
        const latDelta = searchRadius / 111320;
        // 1 degree lng ~= 111.32 km * cos(lat)
        const lngDelta = searchRadius / (111320 * Math.cos(userLat * (Math.PI / 180)));

        const minLat = userLat - latDelta;
        const maxLat = userLat + latDelta;
        const minLng = userLng - lngDelta;
        const maxLng = userLng + lngDelta;

        console.log(`[API] Bounding Box: Lat [${minLat.toFixed(6)}, ${maxLat.toFixed(6)}], Lng [${minLng.toFixed(6)}, ${maxLng.toFixed(6)}]`);

        // Fetch candidates within the bounding box (ALL categories)
        const issues = await prisma.issue.findMany({
            where: {
                status: {
                    in: ['OPEN', 'IN_PROGRESS']
                },
                // Removed category filter - scan ALL reports within radius
                latitude: {
                    gte: minLat,
                    lte: maxLat
                },
                longitude: {
                    gte: minLng,
                    lte: maxLng
                }
            },
            select: {
                id: true,
                title: true,
                category: true,
                latitude: true,
                longitude: true,
                description: true,
                createdAt: true,
                status: true,
                authorId: true
            }
        });

        console.log(`[API] Found ${issues.length} candidates in bounding box`);

        // Refine with Haversine Formula (Circle vs Square)
        const nearbyIssues = issues.filter(issue => {
            const R = 6371e3; // Earth radius in meters
            const phi1 = userLat * Math.PI / 180;
            const phi2 = issue.latitude * Math.PI / 180;
            const dPhi = (issue.latitude - userLat) * Math.PI / 180;
            const dLambda = (issue.longitude - userLng) * Math.PI / 180;

            const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c; // in meters

            console.log(`[API] Candidate ${issue.id}: ${distance.toFixed(2)}m away`);

            return distance <= searchRadius;
        });

        console.log(`[API] Returning ${nearbyIssues.length} matches within ${searchRadius}m`);

        res.json({
            found: nearbyIssues.length > 0,
            count: nearbyIssues.length,
            issues: nearbyIssues
        });
    } catch (error) {
        console.error('Error finding nearby issues:', error);
        res.status(500).json({ error: 'Failed to check nearby issues' });
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
                media: true, // Include media
                department: true // Include department
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
                        'User-Agent': 'Sewasuchak/1.0'
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

// Update issue status (Official/Admin only)
router.patch('/:id/status', authMiddleware, upload.single('proofImage'), async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, rejectionReason, departmentId, govNote } = req.body;
        const userId = req.userId;

        // Check permissions
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || (user.role !== 'OFFICIAL' && user.role !== 'ADMIN')) {
            console.log(`[Authorization Failed] User ${userId} with role ${user?.role} attempted to update status`);
            res.status(403).json({ error: 'Unauthorized: Only Officials/Admins can update status' });
            return;
        }

        // Validate status
        const allowedStatuses = ['REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
        if (!allowedStatuses.includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }

        // Conditional validation
        let proofImageUrl = req.body.proofImageUrl;

        if (req.file) {
            proofImageUrl = `/uploads/${req.file.filename}`;
        }

        if (status === 'RESOLVED' && !proofImageUrl) {
            res.status(400).json({ error: 'Proof image is required for Resolved status' });
            return;
        }

        if (status === 'REJECTED' && !rejectionReason) {
            res.status(400).json({ error: 'Rejection reason is required for Rejected status' });
            return;
        }

        const updateData: any = { status };
        // Clean undefined values
        if (departmentId) {
            if (user.role !== 'ADMIN') {
                res.status(403).json({ error: 'Unauthorized: Only Admins can assign departments' });
                return;
            }
            updateData.departmentId = departmentId;
        }
        if (rejectionReason) updateData.rejectionReason = rejectionReason;
        if (proofImageUrl) updateData.proofImageUrl = proofImageUrl;
        if (govNote) updateData.govNote = govNote;

        // Reset fields if changing status (e.g. from Rejected to In Progress, clear reason)
        if (status !== 'REJECTED') updateData.rejectionReason = null;
        if (status !== 'RESOLVED' && !proofImageUrl) {
            // Optional: keep proof image or clear it? Better to keep if it was there? 
            // Requirement says proof only for Resolved.
            // But if I move from Resolved -> In Progress, maybe I keep it? 
            // Let's leave it for now.
        }

        const issue = await prisma.issue.update({
            where: { id },
            data: updateData
        });

        console.log(`[Status Update] Issue ${id} updated to ${status} by ${user.email}`);
        res.json(issue);
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ error: "Failed to update status" });
    }
});

export default router;
