# Fozzle - Focus on What Matters

A modern productivity web application based on the Signal vs. Noise framework, inspired by Steve Jobs' philosophy of ruthless focus. Fozzle helps you categorize tasks as either "Signal" (critical, important work) or "Noise" (distractions, less essential tasks) to maintain focus on what truly matters.ingleFlow - Focus on What Matters

A modern productivity web application based on the Signal vs. Noise framework, inspired by Steve Jobs' philosophy of ruthless focus. SingleFlow helps you categorize tasks as either "Signal" (critical, important work) or "Noise" (distractions, less essential tasks) to maintain focus on what truly matters.

🚀 **Now Live**: [https://single-flow-rms.vercel.app/](https://single-flow-rms.vercel.app/)

## Features

### 🔐 **Secure Authentication**
- **Google OAuth Integration**: Sign in with your Google account
- **Email/Password Authentication**: Traditional login option
- **Facebook & LinkedIn Login**: (Coming soon - see TODO.md)
- **Secure User Isolation**: Your tasks are private and secure
- **Session Management**: Stay logged in across browser sessions

### 🎯 **Signal vs. Noise Task Management**
- Categorize tasks as Signal (critical work) or Noise (less important)
- Visual drag-and-drop interface for easy task organization
- Maintain the 80/20 rule: 80% Signal, 20% Noise
- **Cloud Sync**: Tasks automatically saved to cloud database
- **Cross-Device Access**: Access your tasks from anywhere

### 📊 **Progress Tracking**
- Real-time statistics and progress visualization
- Daily completion tracking with visual progress rings
- Signal ratio monitoring with color-coded feedback
- **Persistent Analytics**: Historical data preserved across sessions

### 💡 **Idea Parking Lot**
- Capture random ideas without losing focus
- Promote ideas to tasks when ready
- Keep distractions at bay while staying creative
- **Cloud Storage**: Ideas synced across all your devices

### 📈 **Daily Review System**
- End-of-day review with detailed analytics
- Performance insights and recommendations
- Fresh start option for new days
- **Progress History**: Track improvement over time

### 🎨 **Modern Design**
- Dark/Light mode support
- Responsive design for all devices
- Smooth animations and transitions
- Accessible interface with proper ARIA labels
- **Professional UI**: Clean, distraction-free interface

## Technology Stack

- **React 18** with TypeScript for robust component architecture
- **Vite** for lightning-fast development and building
- **Tailwind CSS** for utility-first styling and responsive design
- **@dnd-kit** for accessible drag-and-drop functionality
- **Zustand** for simple and effective state management
- **Lucide React** for beautiful, consistent icons
- **Supabase** for authentication, database, and real-time sync
- **PostgreSQL** for reliable cloud data storage
- **Vercel** for fast, global deployment and hosting

## Architecture

### Frontend
- **React + TypeScript**: Type-safe component development
- **Vite**: Fast development server and optimized builds
- **Tailwind CSS**: Utility-first responsive design
- **Zustand**: Lightweight state management with persistence

### Backend & Database
- **Supabase**: Backend-as-a-Service with PostgreSQL database
- **Row Level Security (RLS)**: User data isolation and privacy
- **Real-time subscriptions**: Instant updates across devices
- **OAuth Integration**: Secure third-party authentication

### Deployment
- **Vercel**: Edge-optimized deployment with automatic CI/CD
- **Environment Variables**: Secure configuration management
- **HTTPS/SSL**: Encrypted connections for all data transfer

## Getting Started

### Live Application
Visit the live application at: **[https://single-flow-rms.vercel.app/](https://single-flow-rms.vercel.app/)**

Simply sign in with your Google account and start organizing your tasks!

### Local Development

#### Prerequisites
- Node.js 16+ and npm
- Supabase account (for database and authentication)

#### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/RaeMarvin/SingleFlow_rms.git
   cd SignalFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```bash
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   
   Get these values from your Supabase project dashboard:
   - Go to [Supabase Dashboard](https://app.supabase.com/)
   - Select your project → Settings → API
   - Copy the Project URL and anon/public key

4. **Set up the database**
   
   Run the SQL schema in your Supabase SQL editor:
   ```bash
   # Use the complete-supabase-schema.sql file
   # This creates tables, RLS policies, and indexes
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Getting Started
1. **Sign Up/Sign In**
   - Visit [Fozzle](https://single-flow-rms.vercel.app/)
   - Click "Sign in with Google" for instant access
   - Or use email/password for traditional authentication
   - Your data is automatically synced across all your devices

### Adding Tasks
1. Click the "Add Task" button in the header
2. Fill in the task title and optional description
3. Choose Signal (important) or Noise (less critical) category
4. Set priority level (High, Medium, Low)
5. Tasks are automatically saved to the cloud

### Managing Tasks
- **Drag and Drop**: Move tasks between Signal and Noise columns
- **Complete Tasks**: Click the checkmark button on any task
- **Delete Tasks**: Click the trash icon (appears on hover)
- **Reorder Tasks**: Drag tasks within columns to prioritize
- **Real-time Sync**: Changes appear instantly on all your devices

### Idea Management
1. Use the Idea Parking Lot to quickly capture thoughts
2. Add ideas without interrupting your current focus
3. Promote ideas to tasks when you're ready to work on them
4. Access your ideas from any device

### Daily Review
- Click the chart icon in the header to open Daily Review
- View your completion rate and signal ratio
- Get insights and recommendations for improvement
- Start fresh for a new day when needed
- Historical data is preserved for long-term tracking

### Account Management
- Click your profile picture in the header for user menu
- Sign out securely when finished
- Data remains safe and accessible when you return

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Main navigation and user controls
│   ├── AuthModal.tsx   # Authentication interface
│   ├── TaskBoard.tsx   # Signal/Noise task columns
│   ├── TaskCard.tsx    # Individual task component
│   ├── StatsPanel.tsx  # Progress tracking display
│   ├── IdeaParkingLot.tsx # Idea capture component
│   ├── DailyReviewModal.tsx # End-of-day review
│   ├── AddTaskModal.tsx # Task creation form
│   └── DebugPanel.tsx  # Development debugging tools
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── store/              # State management
│   ├── useStore.ts     # Local state (Zustand)
│   └── useSupabaseStore.ts # Cloud-synced state
├── lib/                # Utilities and services
│   ├── supabase.ts     # Supabase client configuration
│   └── database.ts     # Database service functions
├── hooks/              # Custom React hooks
│   └── useInitializeData.ts # Data initialization logic
├── types/              # TypeScript type definitions
│   └── index.ts        # Application type definitions
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## Database Schema

### Tables
- **tasks**: User tasks with Signal/Noise categorization
- **ideas**: Idea parking lot entries
- **profiles**: User profile information (future enhancement)

### Security
- **Row Level Security (RLS)**: Each user can only access their own data
- **Authentication Required**: All operations require valid user session
- **UUID Foreign Keys**: Secure relationship to authenticated users

## Configuration

### Environment Variables
```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Authentication Providers
- ✅ **Google OAuth**: Configured and active
- 🔄 **Facebook Login**: Setup instructions in TODO.md
- 🔄 **LinkedIn Login**: Setup instructions in TODO.md
- ✅ **Email/Password**: Available as fallback option

### Data Persistence
- **Cloud Database**: PostgreSQL via Supabase
- **Local Fallback**: Browser localStorage for offline access
- **Real-time Sync**: Automatic synchronization across devices
- **Conflict Resolution**: Smart merging of offline and online changes

## Deployment

Fozzle is deployed on **Vercel** with automatic CI/CD from GitHub:

- **Production URL**: [https://single-flow-rms.vercel.app/](https://single-flow-rms.vercel.app/)
- **GitHub Repository**: [https://github.com/RaeMarvin/SingleFlow_rms](https://github.com/RaeMarvin/SingleFlow_rms)
- **Automatic Deployments**: Every push to main branch triggers new deployment
- **Environment Variables**: Securely configured in Vercel dashboard
- **SSL/HTTPS**: Automatic secure connections

### Deployment Pipeline
1. Code pushed to GitHub repository
2. Vercel detects changes automatically
3. Runs build process with TypeScript compilation
4. Deploys to global CDN edge locations
5. Updates live application instantly

## Security & Privacy

- **OAuth 2.0**: Industry-standard authentication protocols
- **Row Level Security**: Database-level access control
- **HTTPS Everywhere**: All connections encrypted
- **No Data Tracking**: Focus on productivity, not surveillance
- **EU Privacy Compliant**: Respectful data handling practices

## Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
   - Follow existing code patterns
   - Add TypeScript types for new features
   - Test authentication flows thoroughly
4. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
5. **Push to your branch**
   ```bash
   git push origin feature/amazing-feature
   ```
6. **Open a Pull Request**

### Development Guidelines
- **TypeScript**: All new code should be typed
- **Authentication**: Test with multiple providers
- **Responsive Design**: Ensure mobile compatibility
- **Accessibility**: Follow ARIA best practices
- **Performance**: Optimize for fast loading

## Philosophy

Fozzle is built on the principle that **focus is everything**. By clearly distinguishing between Signal (what matters) and Noise (what doesn't), you can:

- Reduce decision fatigue
- Maintain clear priorities
- Achieve better work-life balance
- Make meaningful progress on important projects

"People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas." - Steve Jobs

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support & Feedback

If you find Fozzle helpful, please consider:
- ⭐ **Starring the repository** on GitHub
- 🐛 **Reporting bugs** via GitHub Issues
- 💡 **Requesting features** for future releases
- 🤝 **Contributing** to the codebase
- 📢 **Sharing** with others who might benefit
- 💬 **Providing feedback** on user experience

### Links
- **Live Application**: [https://single-flow-rms.vercel.app/](https://single-flow-rms.vercel.app/)
- **GitHub Repository**: [https://github.com/RaeMarvin/SingleFlow_rms](https://github.com/RaeMarvin/SingleFlow_rms)
- **Issue Tracker**: [GitHub Issues](https://github.com/RaeMarvin/SingleFlow_rms/issues)
- **Documentation**: See `TODO.md` for setup guides

## Roadmap

### Upcoming Features
- 📱 **Mobile App**: Native iOS and Android applications
- 🔔 **Smart Notifications**: Intelligent reminders and insights
- 📊 **Advanced Analytics**: Weekly/monthly progress reports
- 👥 **Team Collaboration**: Shared Signal/Noise boards
- 🎨 **Themes & Customization**: Personalized color schemes
- 🔗 **Integrations**: Calendar, email, and productivity tools

### Authentication Expansion
- ✅ **Google OAuth**: Fully implemented
- 🔄 **Facebook Login**: Instructions in TODO.md
- 🔄 **LinkedIn Login**: Instructions in TODO.md
- 🔄 **Microsoft/Apple ID**: Future consideration
- 🔄 **Magic Links**: Passwordless authentication

---

## Philosophy

SingleFlow is built on the principle that **focus is everything**. By clearly distinguishing between Signal (what matters) and Noise (what doesn't), you can:

- **Reduce Decision Fatigue**: Clear categories eliminate choice paralysis
- **Maintain Clear Priorities**: Always know what deserves your attention
- **Achieve Better Work-Life Balance**: Separate urgent from important
- **Make Meaningful Progress**: Focus energy on high-impact activities
- **Build Sustainable Habits**: Create lasting productivity systems

*"People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas."* - Steve Jobs

## License

MIT License - feel free to use this project for personal or commercial purposes.

---

**Focus on what matters. Everything else is just noise.**

🎯 **Start organizing your life today**: [https://single-flow-rms.vercel.app/](https://single-flow-rms.vercel.app/)
