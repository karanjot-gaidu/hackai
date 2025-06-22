# CreatorStudio - AI-Powered Content Creation Platform

<div align="center">

![CreatorStudio Logo](public/logo.png)

**Empowering the next generation of content creators with AI-driven tools**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-6C47FF?style=for-the-badge)](https://clerk.com/)

[Live Demo](https://hackai-p1gg.vercel.app/) • [Report Bug](https://github.com/karanjot-gaidu/hackai/issues) • [Request Feature](https://github.com/karanjot-gaidu/hackai/issues)

</div>

---

## 🎯 Problem Statement

**90% of aspiring content creators quit within their first 3 months** due to overwhelming complexity and high barriers to entry:

- **Information Overload**: Creators spend more time learning tools than creating content
- **High Barrier to Entry**: Expensive software, steep learning curves, and fragmented workflows
- **Lack of Guidance**: No personalized roadmap for creator success
- **Trend Analysis Paralysis**: Difficulty identifying what content will perform well
- **Content Creation Complexity**: Scriptwriting, design, and production require years of experience

## 🚀 Our Solution

**CreatorStudio** is a comprehensive AI-powered platform for **creators**. We provide an all-in-one solution that eliminates the barriers to content creation success.

### ✨ Key Features

- **🤖 AI Script Generator** - Transform ideas into engaging, viral-ready scripts
- **🎨 Thumbnail Generator** - Create eye-catching thumbnails with AI
- **📊 Trending Analysis** - Real-time TikTok trends and hashtag insights
- **🎯 Personalized Success Plans** - Custom roadmaps based on your goals
- **📱 Video Upload & Subtitles** - Automated subtitle generation for better engagement
- **💬 AI Content Coach** - 24/7 guidance and optimization suggestions
- **🔍 Niche Discovery** - Find your perfect content niche
- **📈 Creator Analytics** - Track performance and growth metrics

---

## 🛠️ Tech Stack

### **Frontend**
- **Next.js 15.3.4** - React framework with App Router
- **TypeScript 5.0** - Type-safe development
- **Tailwind CSS 3.3** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Hook Form** - Form handling and validation

### **Backend & APIs**
- **Next.js API Routes** - Serverless API endpoints
- **Google AI (Gemini)** - Content generation and analysis
- **ZapCap API** - Subtitle generation
- **Apify** - Web scraping for trending data
- **Stable Diffusion** - Image generation (via Hugging Face)

### **Database & Storage**
- **Supabase** - PostgreSQL database with real-time features
- **Supabase Storage** - File storage for videos and images
- **Row Level Security (RLS)** - Secure data access

### **Authentication & Security**
- **Clerk** - Modern authentication and user management
- **JWT Tokens** - Secure API authentication
- **Environment Variables** - Secure configuration management

### **Deployment & Infrastructure**
- **Vercel** - Serverless deployment and hosting
- **GitHub** - Version control and CI/CD
---

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (Next.js)     │◄──►│   (API Routes)  │◄──►│   APIs          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Clerk Auth    │    │   Supabase      │    │   Google AI     │
│   (Users)       │    │   (Database)    │    │   (Content)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Supabase      │
                       │   Storage       │
                       │   (Files)       │
                       └─────────────────┘
```

---

## 🗄️ Database Schema

### **Users Table**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  full_name TEXT,
  is_onboarded BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **Onboarding Data**
```sql
CREATE TABLE onboarding_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  passion TEXT NOT NULL,
  comfort_level TEXT NOT NULL,
  time_available TEXT NOT NULL,
  main_goal TEXT NOT NULL,
  passion_embedding VECTOR(768),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **Content History**
```sql
CREATE TABLE content_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  tool_used TEXT NOT NULL,
  content_type TEXT NOT NULL,
  content_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🤖 AI Models & APIs

### **Content Generation**
- **Google Gemini Pro** - Script generation, content analysis
- **Google Gemini Embeddings** - Semantic search and recommendations
- **Stable Diffusion SDXL** - Thumbnail and image generation

### **Data Processing**
- **ZapCap API** - Automated subtitle generation
- **Apify Scrapers** - Real-time TikTok trend data
- **Custom NLP** - Hashtag analysis and content optimization

### **Integration Examples**

```typescript
// Script Generation
const generateScript = async (contentIdea: string, tone: string) => {
  const response = await fetch('/api/generate-script', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contentIdea, tone })
  });
  return response.json();
};

// Thumbnail Generation
const generateThumbnail = async (prompt: string) => {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  return response.json();
};
```

---

## 🔐 Authentication Flow

### **Clerk Integration**
```typescript
// User authentication with Clerk
import { useUser, useClerk } from '@clerk/nextjs';

const { user, isLoaded } = useUser();
const { signOut } = useClerk();

// Protected API routes
const checkUser = async () => {
  const response = await fetch('/api/auth/check-user', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return response.json();
};
```

### **Security Features**
- **Row Level Security (RLS)** - Database-level access control
- **JWT Token Validation** - Secure API authentication
- **Environment Variable Protection** - Sensitive data security
- **CORS Configuration** - Cross-origin request security

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18+ 
- npm or yarn
- Supabase account
- Clerk account
- Google AI API key

### **Installation**

1. **Clone the repository**
```bash
git clone https://github.com/karanjot-gaidu/hackai.git
cd hackai
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your environment variables:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Google AI
GOOGLE_AI_API_KEY=your_google_ai_key

# ZapCap
ZAPCAP_API_KEY=your_zapcap_key

# Replicate (Stable Diffusion)
HF_TOKEN=your_huggingface_token
```

4. **Set up the database**
```bash
# Run the Supabase schema
psql -h your_supabase_host -U postgres -d postgres -f supabase-schema.sql
```

5. **Start the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

---

## 📱 Live Website

**🌐 Production URL**: [https://hackai-p1gg.vercel.app/](https://hackai-p1gg.vercel.app/)

**🔧 Development**: [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

---

## 📦 Deployment

### **Vercel Deployment**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### **Environment Variables for Production**
Ensure all environment variables are set in your Vercel project settings.

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Next.js Team** - For the amazing React framework
- **Supabase Team** - For the powerful database platform
- **Clerk Team** - For modern authentication
- **Google AI Team** - For the Gemini models
- **Vercel Team** - For seamless deployment

---

<div align="center">

**Made with ❤️ for content creators**

[Back to top](#creatorstudio---ai-powered-content-creation-platform)

</div>