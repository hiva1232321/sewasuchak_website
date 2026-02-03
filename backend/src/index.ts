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
    res.send('CivicConnect API is running');
});

app.use('/uploads', express.static('uploads'));

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
