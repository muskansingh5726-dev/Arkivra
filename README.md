# 📁 Arkivra

### Intelligent Cloud Storage & Secure File Management Platform

Arkivra is a full-stack cloud-based file storage and management application that allows users to securely manage their digital files and folders through a modern and user-friendly interface.

The platform provides essential cloud storage functionality such as user authentication, folder creation, file uploads, file organization, and starred items.

🌐 **Live Demo:** https://arkivra-6derhznis-snzx.vercel.app/

---

## 🚀 Features

### 🔐 Authentication

- User Registration
- User Login
- JWT-based Authentication
- Protected Routes
- Secure User Sessions

### 📁 Folder Management

- Create folders
- Organize files into folders
- Navigate through folders
- Folder hierarchy support
- Breadcrumb navigation

### 📄 File Management

- Upload files
- View uploaded files
- Organize files inside folders
- File information display

### ⭐ Starred Items

- Star important files
- Star important folders
- View all starred files and folders
- Unstar items

### 🎨 Modern User Interface

- Clean and responsive dashboard
- Sidebar navigation
- Modern cloud storage interface
- Interactive hover effects
- Responsive layout

---

## 🛠️ Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- CSS Modules

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Authentication

- JSON Web Tokens (JWT)
- bcryptjs

### File Upload

- Multer

### Deployment

- Frontend: Vercel
- Backend: Render
- Database: Supabase PostgreSQL

---

## 🏗️ Project Architecture

```text
Arkivra
│
├── apps
│   │
│   ├── web
│   │   ├── app
│   │   │   ├── starred
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   └── lib
│   │       └── api.ts
│   │
│   └── api
│       ├── prisma
│       │   ├── migrations
│       │   └── schema.prisma
│       │
│       └── src
│           ├── controllers
│           ├── middleware
│           ├── routes
│           ├── utils
│           └── server.ts
│
├── package.json
└── README.md
