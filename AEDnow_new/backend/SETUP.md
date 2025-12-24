# Backend Setup Instructions

## Steps to Run the Backend

1. **Navigate to backend folder:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file** (if not already created):
```
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/CollabData?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
```

4. **Start the server:**
```bash
npm run dev
```

5. **Test the API:**
Open your browser or use Postman to test: `http://localhost:3000/api/aedlocations`

## Frontend Setup

The frontend will automatically fetch AED locations from the backend. Make sure:

1. Backend is running on `http://localhost:3000`
2. If using a physical device or emulator, update `API_BASE_URL` in `app/(tabs)/index.tsx` to your computer's IP address:
   ```typescript
   const API_BASE_URL = 'http://YOUR_IP_ADDRESS:3000/api';
   ```

## API Endpoints

- `GET /api/aedlocations` - Get all AED locations
- `GET /api/aedlocations/:id` - Get single AED location by ID
- `GET /api/aedlocations/nearby?latitude=X&longitude=Y&maxDistance=5000` - Get nearby AEDs

## Testing Connection

1. Start backend: `npm run dev`
2. Visit: `http://localhost:3000/health` - Should show "Server is running"
3. Visit: `http://localhost:3000/api/aedlocations` - Should show your AED data from MongoDB
