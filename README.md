# RefugeeConnect Uganda

A comprehensive platform connecting refugees in Uganda with essential services, information, and community support. This application provides AI-powered assistance, information hub, service directory, and community features to help refugees navigate life in Uganda.

## Features

- 🤖 **AI Assistant**: Get instant answers to questions in multiple languages (English, Swahili, Luganda, Arabic, and more)
- 📚 **Information Hub**: Access important information about registration, legal rights, healthcare, education, employment, and more
- 🏥 **Services Directory**: Find and access various services available to refugees
- 👥 **Community**: Connect with other refugees, join community groups, and share experiences
- 🚨 **Emergency Contacts**: Quick access to emergency services and contacts
- 🌍 **Multi-language Support**: Available in English, Kiswahili, Luganda, Acholi, Arabic, and more
- 📱 **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v4.4 or higher) - Make sure MongoDB is running on your system
- **npm** (comes with Node.js)

## Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd "Capstone Project"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Copy `.env.example` to `.env`
   ```bash
   copy .env.example .env
   ```
   - Edit `.env` and update the following:
     - `MONGODB_URI`: Your MongoDB connection string (default: `mongodb://localhost:27017/refugeeconnect`)
     - `SESSION_SECRET`: A random secret string for session encryption
     - `OPENAI_API_KEY`: Your OpenAI API key (required for AI Assistant feature)
     - `PORT`: Server port (default: 5000)

4. **Create necessary directories**
   ```bash
   mkdir -p refugeeconnect-uganda/uploads/information
   mkdir -p public
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

This will start the server with nodemon, which automatically restarts when you make changes.

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

## Accessing the Application

Once the server is running:

- **Homepage**: http://localhost:5000
- **Login**: http://localhost:5000/auth/login
- **Register**: http://localhost:5000/auth/register
- **Dashboard**: http://localhost:5000/dashboard (requires login)

## Project Structure

```
refugeeconnect-uganda/
├── models/              # MongoDB models (User, Information, AIInteraction)
├── routes/              # Express routes
│   ├── auth.js         # Authentication routes
│   ├── ai.js           # AI Assistant routes
│   ├── information.js  # Information hub routes
│   ├── services.js     # Services directory routes
│   ├── emergency.js    # Emergency contacts routes
│   ├── community.js    # Community features routes
│   └── index.js        # Main page routes
├── middleware/          # Express middleware
│   ├── auth.js         # Authentication middleware
│   └── errorHandler.js # Error handling middleware
├── services/            # Business logic services
│   └── AIService.js    # OpenAI integration service
├── views/               # EJS templates
│   ├── layouts/        # Layout templates
│   ├── pages/          # Page templates
│   └── partials/       # Reusable partials
└── server.js           # Main server file
```

## Configuration

### MongoDB Setup

1. **Install MongoDB** (if not already installed)
   - Windows: Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - macOS: `brew install mongodb-community`
   - Linux: Follow [MongoDB Installation Guide](https://docs.mongodb.com/manual/installation/)

2. **Start MongoDB**
   - Windows: MongoDB should start as a service automatically
   - macOS/Linux: `mongod` or `sudo systemctl start mongod`

3. **Verify MongoDB is running**
   ```bash
   mongosh
   ```
   If this connects successfully, MongoDB is running.

### OpenAI API Key Setup

1. **Sign up for OpenAI**: Go to [OpenAI Platform](https://platform.openai.com/)
2. **Create an API key**: Navigate to API Keys section and create a new key
3. **Add to .env**: Copy your API key to the `OPENAI_API_KEY` variable in `.env`

**Note**: The AI Assistant feature requires a valid OpenAI API key. Without it, the AI features will not work.

## Usage Guide

### For Users

1. **Register**: Create an account by providing your information
2. **Login**: Access your personalized dashboard
3. **Browse Information**: Explore the information hub for relevant content
4. **Use AI Assistant**: Ask questions and get instant answers
5. **Find Services**: Browse the services directory
6. **Join Community**: Connect with other refugees in community groups

### For Administrators

- User management features can be added
- Information can be created, updated, and deleted through the API
- Analytics are available through the AI analytics endpoint (requires admin role)

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout user
- `PUT /auth/profile` - Update user profile
- `POST /auth/change-password` - Change password

### AI Assistant
- `POST /api/ai/query` - Submit AI query
- `GET /api/ai/history` - Get interaction history
- `POST /api/ai/feedback/:interactionId` - Submit feedback

### Information
- `GET /api/information` - Get all information (with filters)
- `GET /api/information/:id` - Get single information item
- `POST /api/information` - Create information (protected)
- `PUT /api/information/:id` - Update information (protected)
- `DELETE /api/information/:id` - Delete information (protected)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:id` - Get service by ID

### Emergency
- `GET /api/emergency/contacts` - Get emergency contacts
- `POST /api/emergency/report` - Report emergency

### Community
- `GET /api/community/groups` - Get community groups
- `POST /api/community/groups/:groupId/join` - Join group
- `GET /api/community/messages` - Get messages
- `POST /api/community/messages` - Post message

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongosh` should connect
- Check `MONGODB_URI` in `.env` is correct
- Verify MongoDB is accessible on the specified port

### OpenAI API Errors
- Verify your API key is correct in `.env`
- Check your OpenAI account has available credits
- Ensure the API key has proper permissions

### Port Already in Use
- Change the `PORT` in `.env` to a different port
- Or stop the process using the port

### Session Issues
- Ensure `SESSION_SECRET` is set in `.env`
- Clear browser cookies if experiencing login issues

## Security Notes

- **Never commit `.env` file** to version control
- Use strong `SESSION_SECRET` in production
- Keep dependencies updated for security patches
- Use HTTPS in production
- Implement rate limiting (already configured)
- Validate and sanitize all user inputs

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Template Engine**: EJS
- **AI Integration**: OpenAI API
- **Real-time**: Socket.IO
- **Security**: Helmet, CORS, express-rate-limit
- **File Upload**: Multer
- **Session Management**: express-session with MongoDB store

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

ISC

## Support

For issues, questions, or contributions, please contact the development team.

---

**Built with ❤️ for the refugee community in Uganda**
