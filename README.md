# Design Agent - AI-Powered Design Platform

A comprehensive design agent platform with Firebase Firestore database and support for multiple AI providers (OpenAI, Gemini, Qwen).

## 🚀 Features

### For Users:
- Create and manage design projects
- Upload brand elements (color palettes, logos, fonts)
- Generate unlimited design variations using multiple AI providers
- Support for social media, print, thumbnail, and logo designs
- Base reference image upload
- Content customization (title, copy, description, CTA, footer)

### For Super Admins:
- Train the AI with creative designs, posters, infographics
- Upload training data to improve AI capabilities
- Admin dashboard with system statistics
- Manage AI provider settings and status
- Monitor provider availability and performance

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, TypeScript
- **Database**: Firebase Firestore
- **AI Providers**: OpenAI DALL-E 3, Google Gemini, Alibaba Qwen
- **Authentication**: JWT
- **File Processing**: Sharp, Multer

## 📋 Prerequisites

- Node.js (v18 or higher)
- Firebase project with Firestore enabled
- API keys for AI providers:
  - OpenAI API key
  - Google Gemini API key
  - Alibaba Qwen API key

## ⚡ Quick Start

### 1. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Firestore Database
3. Create a service account:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

### 2. Clone and Install Dependencies

```bash
# Clone the repository
git clone <your-repo-url>
cd design-agent

# Install all dependencies
npm run install:all
```

### 3. Environment Setup

```bash
# Copy environment file
cp env.example .env

# Edit .env with your configuration
# Required: Firebase service account details, AI provider API keys
```

### 4. Start Development Servers

```bash
# Start both backend and frontend
npm run dev

# Or start individually:
# Backend only: npm run dev:backend
# Frontend only: npm run dev:frontend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🤖 AI Provider Configuration

### OpenAI
1. Get API key from https://platform.openai.com/api-keys
2. Add to `.env`: `OPENAI_API_KEY=your-key-here`

### Google Gemini
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to `.env`: `GEMINI_API_KEY=your-key-here`

### Alibaba Qwen
1. Get API key from https://dashscope.aliyuncs.com/
2. Add to `.env`: `QWEN_API_KEY=your-key-here`

## 📁 Project Structure

```
design-agent/
├── backend/                 # Node.js/Express API
│   ├── src/
│   │   ├── index.ts        # Main server file
│   │   └── ...
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API services
│   │   └── ...
├── uploads/                # File uploads
│   ├── designs/
│   ├── training/
│   └── brand-elements/
└── README.md
```

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Building for Production
```bash
npm run build
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Designs
- `GET /api/designs/project/:projectId` - Get designs for project
- `POST /api/designs` - Create new design
- `POST /api/designs/:id/generate` - Generate new versions

### AI Providers
- `GET /api/ai/providers` - Get available AI providers

### Admin
- `POST /api/admin/training-data` - Upload training data
- `GET /api/admin/training-data` - Get all training data
- `GET /api/admin/dashboard` - Get admin statistics

## 🔐 Environment Variables

```env
# Firebase Configuration
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account-email%40your-project.iam.gserviceaccount.com

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# AI Providers
OPENAI_API_KEY=your-openai-api-key-here
GEMINI_API_KEY=your-gemini-api-key-here
QWEN_API_KEY=your-qwen-api-key-here
QWEN_API_URL=https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis

# Server
PORT=5000
NODE_ENV=development

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Default AI Provider (openai, gemini, qwen)
DEFAULT_AI_PROVIDER=openai
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for DALL-E 3 API
- Google for Gemini API
- Alibaba for Qwen API
- Firebase for database services
- React and Node.js communities

## 📞 Support

If you have any questions or need help, please open an issue or contact the development team.

---

**Happy Designing! 🎨✨**
