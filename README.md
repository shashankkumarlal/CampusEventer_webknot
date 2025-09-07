# CampusEventer 🎓

A modern campus event management platform with an AI-powered chatbot assistant.

![CampusEventer Demo](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## 🚀 Features

- **Event Management**: Create, update, and manage campus events
- **AI Chatbot**: Get instant help with event-related queries
- **User Authentication**: Secure login and registration
- **Admin Dashboard**: Manage events and users
- **Responsive Design**: Works on all devices

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Node.js, Express
- **Database**: SQLite
- **AI**: GROQ API
- **Styling**: Tailwind CSS
- **State Management**: React Query

## 📦 Prerequisites

- Node.js 16+
- npm or yarn
- GROQ API Key

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/CampusEventer.git
   cd CampusEventer
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install server dependencies
   cd server
   npm install
   
   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Update the environment variables in `.env`

4. **Start Development Servers**
   ```bash
   # In root directory
   npm run dev
   ```

## 🌐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server
PORT=5000
NODE_ENV=development

# GROQ API
GROQ_API_KEY=your-groq-api-key

# Session
SESSION_SECRET=your-session-secret
```

## 📂 Project Structure

```
CampusEventer/
├── client/                 # Frontend React application
├── server/                 # Backend Express server
├── shared/                 # Shared TypeScript types
└── .github/                # GitHub workflows
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/)
- [React](https://reactjs.org/)
- [Express](https://expressjs.com/)
- [GROQ](https://www.groq.com/)

---

<div align="center">
  Made with ❤️ by Your Name
</div>
