# {{projectName}}

{{description}}

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm 8+

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd {{projectName}}
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm run dev
```

The server will start at `http://localhost:3000`

## 📜 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Check code style
- `npm run lint:fix` - Fix code style issues

## 🛠️ API Endpoints

### Health Check
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health information

### API Routes
- `GET /api/welcome` - API welcome message
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 📁 Project Structure

```
src/
├── index.js              # Main application file
├── controllers/          # Request handlers
│   └── userController.js
├── routes/              # Route definitions
│   ├── api.js
│   └── health.js
├── middleware/          # Custom middleware
│   └── errorHandler.js
└── utils/              # Utility functions
    └── logger.js
```

## 🧪 Testing

Run tests with:
```bash
npm test
```

## 🔧 Environment Variables

Create a `.env` file with:
```
NODE_ENV=development
PORT=3000
```

## 👤 Author

Created by {{authorName}}

## 📄 License

This project is licensed under the MIT License.
