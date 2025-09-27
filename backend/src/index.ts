import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';
import admin from 'firebase-admin';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Firebase
let db: admin.firestore.Firestore;

try {
  const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
  };

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
  }

  db = admin.firestore();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.log('⚠️  Firebase not configured - running in demo mode');
  console.log('   Please configure Firebase credentials in .env file');
  
  // Mock database for demo mode
  db = {
    collection: (name: string) => ({
      add: async (data: any) => ({ id: 'demo-' + Date.now() }),
      where: () => ({
        get: async () => ({ docs: [], empty: true }),
        orderBy: () => ({ get: async () => ({ docs: [] }) })
      }),
      doc: () => ({
        get: async () => ({ exists: false, data: () => null }),
        update: async () => {},
        set: async () => {}
      })
    })
  } as any;
}

// Initialize AI Services
let openai: OpenAI;
let gemini: GoogleGenerativeAI;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    console.log('✅ OpenAI initialized successfully');
  } else {
    console.log('⚠️  OpenAI API key not configured');
  }
} catch (error) {
  console.log('⚠️  OpenAI initialization failed');
}

try {
  if (process.env.GEMINI_API_KEY) {
    gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini initialized successfully');
  } else {
    console.log('⚠️  Gemini API key not configured');
  }
} catch (error) {
  console.log('⚠️  Gemini initialization failed');
}

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Multer for file uploads (use memory storage to access file buffer, add size limits)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Create upload directories
const createUploadDirs = async () => {
  const dirs = ['uploads/designs', 'uploads/training', 'uploads/brand-elements', 'uploads/references'];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
};

// Auth middleware
const auth = (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    req.userId = decoded.userId;
    req.role = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Helper function for image processing
const processAndSaveImage = async (imageBuffer: Buffer, filename: string, folder: string = 'designs'): Promise<string> => {
  try {
    const uploadDir = path.join(process.env.UPLOAD_PATH || './uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });
    const processedImage = await sharp(imageBuffer).resize(1024, 1024, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer();
    const filePath = path.join(uploadDir, filename);
    await fs.writeFile(filePath, processedImage);
    return filePath;
  } catch (error) {
    console.error('Error processing image:', error);
    throw new Error('Failed to process image');
  }
};

// AI Service
const generateDesign = async (project: any, content: any, provider: string = 'openai'): Promise<string> => {
  const prompt = `Create a professional ${project.designType} design. 
    Colors: ${project.brandElements?.colorPalette?.join(', ') || 'default'}
    Fonts: ${project.brandElements?.fonts?.join(', ') || 'modern'}
    Title: ${content.title || ''}
    Copy: ${content.copy || ''}
    Description: ${content.description || ''}
    CTA: ${content.cta || ''}
    Footer: ${content.footerContent || ''}
    Make it modern, professional, and visually appealing.`;

  try {
    switch (provider) {
      case 'openai':
        if (!openai) {
          return `https://via.placeholder.com/1024x1024/FF6B6B/FFFFFF?text=OpenAI+Not+Configured`;
        }
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid"
        });
        return response.data[0].url || '';
      
      case 'gemini':
        if (!gemini) {
          return `https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=Gemini+Not+Configured`;
        }
        return `https://via.placeholder.com/1024x1024/4F46E5/FFFFFF?text=Gemini+Generated+Design`;
      
      case 'qwen':
        return `https://via.placeholder.com/1024x1024/10B981/FFFFFF?text=Qwen+Generated+Design`;
      
      default:
        return `https://via.placeholder.com/1024x1024/6B7280/FFFFFF?text=Demo+Design+${provider.toUpperCase()}`;
    }
  } catch (error) {
    console.error(`Error generating design with ${provider}:`, error);
    return `https://via.placeholder.com/1024x1024/EF4444/FFFFFF?text=Error+Generating+Design`;
  }
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if user exists
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    
    if (!snapshot.empty) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userData = {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      // Always assign the least-privileged role on registration
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await userRef.add(userData);

    // Generate token
    const token = jwt.sign(
      { userId: docRef.id, role: userData.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: docRef.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const userRef = db.collection('users');
    const snapshot = await userRef.where('email', '==', email).get();
    
    if (snapshot.empty) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    // Check password
    const isMatch = await bcrypt.compare(password, userData.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: userDoc.id, role: userData.role },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: userDoc.id,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const userData = userDoc.data()!;
    delete userData.password;
    res.json({ id: userDoc.id, ...userData });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Project Routes
app.get('/api/projects', auth, async (req, res) => {
  try {
    const projectsRef = db.collection('projects');
    const snapshot = await projectsRef.where('userId', '==', req.userId).orderBy('createdAt', 'desc').get();
    
    const projects = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/projects', auth, async (req, res) => {
  try {
    const { name, description, brandElements, designType } = req.body;

    const projectData = {
      name,
      description,
      userId: req.userId,
      brandElements: brandElements || { colorPalette: [], fonts: [] },
      designType,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('projects').add(projectData);
    res.status(201).json({ _id: docRef.id, ...projectData });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Design Routes
app.get('/api/designs/project/:projectId', auth, async (req, res) => {
  try {
    const designsRef = db.collection('designs');
    const snapshot = await designsRef
      .where('projectId', '==', req.params.projectId)
      .where('userId', '==', req.userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    const designs = snapshot.docs.map(doc => ({
      _id: doc.id,
      ...doc.data()
    }));
    
    res.json(designs);
  } catch (error) {
    console.error('Get designs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/designs', auth, async (req, res) => {
  try {
    const { projectId, content, baseReferenceImage } = req.body;

    // Verify project belongs to user
    const projectDoc = await db.collection('projects').doc(projectId).get();
    if (!projectDoc.exists || projectDoc.data()!.userId !== req.userId) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const designData = {
      projectId,
      userId: req.userId,
      content: content || {},
      baseReferenceImage,
      generatedImages: [],
      currentVersion: 0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('designs').add(designData);
    res.status(201).json({ _id: docRef.id, ...designData });
  } catch (error) {
    console.error('Create design error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate new versions with AI provider selection
app.post('/api/designs/:id/generate', auth, async (req, res) => {
  try {
    const { count = 3, provider = 'openai' } = req.body;

    const designDoc = await db.collection('designs').doc(req.params.id).get();
    if (!designDoc.exists) {
      return res.status(404).json({ message: 'Design not found' });
    }

    const designData = designDoc.data()!;
    if (designData.userId !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const projectDoc = await db.collection('projects').doc(designData.projectId).get();
    if (!projectDoc.exists) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectData = projectDoc.data()!;

    // Generate new versions
    const imageUrls = await Promise.all(
      Array.from({ length: count }, () => 
        generateDesign(projectData, designData.content, provider)
      )
    );

    // Update design with new versions
    await db.collection('designs').doc(req.params.id).update({
      generatedImages: [...designData.generatedImages, ...imageUrls],
      currentVersion: designData.currentVersion + count,
      updatedAt: new Date()
    });

    res.json({
      message: 'New versions generated successfully',
      newVersions: imageUrls,
      totalVersions: designData.currentVersion + count,
      provider
    });
  } catch (error) {
    console.error('Generate versions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// AI Provider Routes
app.get('/api/ai/providers', async (req, res) => {
  try {
    const providers = [
      { name: 'openai', available: !!process.env.OPENAI_API_KEY },
      { name: 'gemini', available: !!process.env.GEMINI_API_KEY },
      { name: 'qwen', available: !!process.env.QWEN_API_KEY }
    ];
    
    res.json(providers);
  } catch (error) {
    console.error('Get providers error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin Routes
app.post('/api/admin/training-data', auth, upload.single('image'), async (req, res) => {
  try {
    if (req.role !== 'super_admin') {
      return res.status(403).json({ message: 'Access denied. Super admin required.' });
    }
    
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    const { designType, tags, description } = req.body;
    const filename = `training_${Date.now()}.jpg`;
    const imagePath = await processAndSaveImage(req.file.buffer, filename, 'training');

    const trainingData = {
      uploadedBy: req.userId,
      imagePath,
      designType,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
      description,
      isProcessed: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await db.collection('trainingData').add(trainingData);
    res.status(201).json({ message: 'Training data uploaded successfully', trainingData: { _id: docRef.id, ...trainingData } });
  } catch (error) {
    console.error('Upload training data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Design Agent API is running',
    database: 'Firebase Firestore',
    aiProviders: ['openai', 'gemini', 'qwen'],
    status: 'healthy'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Initialize
const startServer = async () => {
  try {
    await createUploadDirs();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🗄️  Database: Firebase Firestore (Demo Mode)`);
      console.log(`🤖 AI Providers: Demo Mode (Configure API keys for real generation)`);
      console.log(`🌐 Frontend: http://localhost:3000`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

startServer();

