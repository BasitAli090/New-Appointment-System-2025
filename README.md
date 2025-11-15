# Al Farooq Kidney Center - Appointment Management System

Modern appointment management system with database integration and Vercel deployment.

## Features

- ✅ Today's and Yesterday's appointments (separate)
- ✅ Patient List with availability status
- ✅ Search functionality
- ✅ Statistics dashboard
- ✅ Toast notifications
- ✅ Modern UI/UX design
- ✅ Database integration (Supabase)
- ✅ Vercel deployment ready

## Setup Instructions

### 1. Database Setup (Supabase)

1. Go to [Supabase](https://supabase.com) and create a free account
2. Create a new project
3. Go to SQL Editor and run the SQL from `database/schema.sql`
4. Copy your project URL and anon key from Settings > API

### 2. Environment Variables

1. Copy `.env.example` to `.env.local`
2. Add your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 3. Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

### 4. Deploy to Vercel

#### Option 1: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Add environment variables
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
```

#### Option 2: Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository (GitHub/GitLab/Bitbucket)
4. Add environment variables in project settings:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
5. Click "Deploy"

### 5. Update Frontend API URL

After deployment, update the API base URL in `script.js`:

```javascript
const API_BASE_URL = 'https://your-vercel-app.vercel.app/api';
```

Or use environment variable for local development.

## Project Structure

```
.
├── api/                    # Vercel serverless functions
│   ├── appointments.js    # Appointments CRUD
│   └── patient-status.js  # Patient status management
├── database/
│   └── schema.sql         # Database schema
├── index.html             # Main HTML file
├── script.js              # Frontend JavaScript
├── styles.css             # Styles
├── package.json           # Dependencies
├── vercel.json            # Vercel configuration
└── README.md             # This file
```

## API Endpoints

### Appointments

- `GET /api/appointments?doctor=umar&type=today` - Get appointments
- `POST /api/appointments` - Add appointment
- `PUT /api/appointments` - Update appointment
- `DELETE /api/appointments?id=123&type=today` - Delete appointment

### Patient Status

- `GET /api/patient-status?doctor=umar&type=today` - Get patient status
- `POST /api/patient-status` - Update patient status

## Technologies Used

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## License

MIT

