# 🎬 TubeVerse

**TubeVerse** is a full-stack YouTube clone built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js). It allows users to create channels, upload videos, interact with content through likes, comments, and subscriptions, and manage their entire video ecosystem—just like on YouTube.

---

## 🚀 Live Demo

- **Link**: [https://tube-verse-fullstack-mern.vercel.app/](https://tube-verse-fullstack-mern.vercel.app/)

---

## 📌 Features

### 👤 User & Channel Management
- Create an account and secure login using JWT authentication.
- Create your personal **Channel**.
- Edit and manage your channel profile and content.

### 📹 Video Upload & Playback
- Upload videos using **Multer** for file handling and **Cloudinary** for media storage.
- View videos with dynamic view count updates.

### 📊 Video Management & Analytics
- Access a dashboard to manage your uploaded content.
- See detailed video stats including views, likes, and engagement.

### 📚 Playlists & History
- Watch history tracking.
- Create, update, and delete **Playlists**.
- Add/remove videos to/from playlists.

### ❤️ Social Interactions
- **Like**, **Comment**, and **Subscribe** to other channels.
- Manage your subscriptions and interact with content across the platform.

---

## 🛠️ Tech Stack

### 🌐 Frontend
- React.js (with React Router)
- Tailwind CSS / CSS Modules
- Axios

### 🔧 Backend
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT for Authentication
- Multer for handling file uploads
- Cloudinary for storing videos/images

### 🌍 Deployment
- **Frontend** deployed on [Vercel](https://tube-verse-fullstack-mern.vercel.app/)
- **Backend** deployed on [Render](https://tubeverse-fullstack-mern.onrender.com/)


---

## 🔐 Authentication

- Uses **JWT (JSON Web Tokens)** for secure, stateless authentication.
- Auth flow includes: Register → Login → Token issuance → Protected Routes.

---

## ☁️ Media Storage

- All video and thumbnail files are securely stored on **Cloudinary**.
- Uploads handled using **Multer** middleware for multipart/form-data parsing.

---

## ✅ TODO / Upcoming Features

* Tweets Page (similar to community posts)
* Notifications system


---

## 🙌 Acknowledgments

* Inspired by YouTube’s UI/UX and creator ecosystem.
* Built with 💙 by [Harshal Sharma](https://github.com/Harshalsharma05)

---

