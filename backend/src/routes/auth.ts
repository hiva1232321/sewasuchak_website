import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middleware/authMiddleware';

// Use require for .js module
const { sendOtpEmail } = require('../nodemailer');

const router = Router();
import { prisma } from '../lib/prisma';

function generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function getJwtSecret(): string {
    return process.env.JWT_SECRET || 'fallback_secret';
}

// ==================== SIGNUP ====================
router.post('/signup', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ error: 'Name, email, and password are required' });
            return;
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            if (existingUser.isVerified) {
                res.status(409).json({ error: 'An account with this email already exists' });
                return;
            }
            // User exists but not verified - update their info and resend OTP
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.update({
                where: { email },
                data: { name, phone: phone || null, password: hashedPassword }
            });
        } else {
            // Create new user
            const hashedPassword = await bcrypt.hash(password, 10);
            await prisma.user.create({
                data: {
                    name,
                    email,
                    phone: phone || null,
                    password: hashedPassword,
                    role: 'CITIZEN',
                    isVerified: false,
                }
            });
        }

        // Delete any existing OTPs for this email
        await prisma.otp.deleteMany({ where: { email, type: 'SIGNUP' } });

        // Generate and save OTP
        const otpCode = generateOtp();
        await prisma.otp.create({
            data: {
                email,
                code: otpCode,
                type: 'SIGNUP',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            }
        });

        // Send OTP email
        console.log(`🔑 [SIGNUP OTP] ${email}: ${otpCode}`);
        await sendOtpEmail(email, otpCode, 'SIGNUP');

        res.status(201).json({ message: 'Account created. Please verify your email with the OTP sent.' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Failed to create account' });
    }
});

// ==================== VERIFY OTP (SIGNUP) ====================
router.post('/verify-otp', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            res.status(400).json({ error: 'Email and OTP code are required' });
            return;
        }

        const otp = await prisma.otp.findFirst({
            where: {
                email,
                code,
                type: 'SIGNUP',
                expiresAt: { gt: new Date() }
            }
        });

        if (!otp) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }

        // Mark user as verified
        const user = await prisma.user.update({
            where: { email },
            data: { isVerified: true }
        });

        // Clean up OTPs
        await prisma.otp.deleteMany({ where: { email, type: 'SIGNUP' } });

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

        res.json({
            message: 'Email verified successfully',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ error: 'Failed to verify OTP' });
    }
});

// ==================== RESEND OTP ====================
router.post('/resend-otp', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, type = 'SIGNUP' } = req.body;

        if (!email) {
            res.status(400).json({ error: 'Email is required' });
            return;
        }

        // Delete existing OTPs
        await prisma.otp.deleteMany({ where: { email, type } });

        // Generate new OTP
        const otpCode = generateOtp();
        await prisma.otp.create({
            data: {
                email,
                code: otpCode,
                type,
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            }
        });

        console.log(`🔑 [RESEND OTP] ${email}: ${otpCode}`);
        await sendOtpEmail(email, otpCode, type);

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Resend OTP error:', error);
        res.status(500).json({ error: 'Failed to resend OTP' });
    }
});

// ==================== LOGIN ====================
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        if (!user.isVerified) {
            res.status(403).json({ error: 'Email not verified. Please verify your email first.', needsVerification: true });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
});

// ==================== GET CURRENT USER ====================
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user info' });
    }
});

// ==================== SEND REPORT OTP ====================
router.post('/send-report-otp', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Delete existing report OTPs for this user
        await prisma.otp.deleteMany({ where: { email: user.email, type: 'REPORT' } });

        const otpCode = generateOtp();
        await prisma.otp.create({
            data: {
                email: user.email,
                code: otpCode,
                type: 'REPORT',
                expiresAt: new Date(Date.now() + 10 * 60 * 1000),
            }
        });

        console.log(`🔑 [REPORT OTP] ${user.email}: ${otpCode}`);
        await sendOtpEmail(user.email, otpCode, 'REPORT');

        res.json({ message: 'Report verification OTP sent to your email' });
    } catch (error) {
        console.error('Send report OTP error:', error);
        res.status(500).json({ error: 'Failed to send report OTP' });
    }
});

// ==================== VERIFY REPORT OTP ====================
router.post('/verify-report-otp', authMiddleware, async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;
        const user = await prisma.user.findUnique({ where: { id: req.userId } });

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        const otp = await prisma.otp.findFirst({
            where: {
                email: user.email,
                code,
                type: 'REPORT',
                expiresAt: { gt: new Date() }
            }
        });

        if (!otp) {
            res.status(400).json({ error: 'Invalid or expired OTP' });
            return;
        }

        // Clean up
        await prisma.otp.deleteMany({ where: { email: user.email, type: 'REPORT' } });

        res.json({ message: 'Report OTP verified successfully', verified: true });
    } catch (error) {
        console.error('Verify report OTP error:', error);
        res.status(500).json({ error: 'Failed to verify report OTP' });
    }
});

export default router;
