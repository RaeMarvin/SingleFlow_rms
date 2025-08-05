# SingleFlow - Focus on What Matters

A modern productivity web application based on the Signal vs. Noise framework, inspired by Steve Jobs' philosophy of ruthless focus. SingleFlow helps you categorize tasks as either "Signal" (critical, important work) or "Noise" (distractions, less essential tasks) to maintain focus on what truly matters.

## Features

### 🎯 **Signal vs. Noise Task Management**
- Categorize tasks as Signal (critical work) or Noise (less important)
- Visual drag-and-drop interface for easy task organization
- Maintain the 80/20 rule: 80% Signal, 20% Noise

### 📊 **Progress Tracking**
- Real-time statistics and progress visualization
- Daily completion tracking with visual progress rings
- Signal ratio monitoring with color-coded feedback

### 💡 **Idea Parking Lot**
- Capture random ideas without losing focus
- Promote ideas to tasks when ready
- Keep distractions at bay while staying creative

### 📈 **Daily Review System**
- End-of-day review with detailed analytics
- Performance insights and recommendations
- Fresh start option for new days

### 🎨 **Modern Design**
- Dark/Light mode support
- Responsive design for all devices
- Smooth animations and transitions
- Accessible interface with proper ARIA labels

## Technology Stack

- **React 18** with TypeScript for robust component architecture
- **Vite** for lightning-fast development and building
- **Tailwind CSS** for utility-first styling and responsive design
- **@dnd-kit** for accessible drag-and-drop functionality
- **Zustand** for simple and effective state management
- **Lucide React** for beautiful, consistent icons

## Getting Started

### Prerequisites
- Node.js 16+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd singleflow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage Guide

### Adding Tasks
1. Click the "Add Task" button in the header
2. Fill in the task title and optional description
3. Choose Signal (important) or Noise (less critical) category
4. Set priority level (High, Medium, Low)

### Managing Tasks
- **Drag and Drop**: Move tasks between Signal and Noise columns
- **Complete Tasks**: Click the checkmark button on any task
- **Delete Tasks**: Click the trash icon (appears on hover)

### Idea Management
1. Use the Idea Parking Lot to quickly capture thoughts
2. Add ideas without interrupting your current focus
3. Promote ideas to tasks when you're ready to work on them

### Daily Review
- Click the chart icon in the header to open Daily Review
- View your completion rate and signal ratio
- Get insights and recommendations for improvement
- Start fresh for a new day when needed

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Main navigation and controls
│   ├── TaskBoard.tsx   # Signal/Noise task columns
│   ├── TaskCard.tsx    # Individual task component
│   ├── StatsPanel.tsx  # Progress tracking display
│   ├── IdeaParkingLot.tsx # Idea capture component
│   ├── DailyReviewModal.tsx # End-of-day review
│   └── AddTaskModal.tsx # Task creation form
├── store/              # State management
│   └── useStore.ts     # Zustand store configuration
├── types/              # TypeScript type definitions
│   └── index.ts        # Application type definitions
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and Tailwind imports
```

## Configuration

### Tailwind CSS
The app uses custom color schemes for Signal and Noise categories:
- **Signal**: Blue tones (important tasks)
- **Noise**: Red/Orange tones (less critical tasks)

### Local Storage
All data is automatically saved to browser localStorage, ensuring your tasks and progress persist between sessions.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Philosophy

SingleFlow is built on the principle that **focus is everything**. By clearly distinguishing between Signal (what matters) and Noise (what doesn't), you can:

- Reduce decision fatigue
- Maintain clear priorities
- Achieve better work-life balance
- Make meaningful progress on important projects

"People think focus means saying yes to the thing you've got to focus on. But that's not what it means at all. It means saying no to the hundred other good ideas." - Steve Jobs

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you find SingleFlow helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs or requesting features
- 🤝 Contributing to the codebase
- 📢 Sharing with others who might benefit

---

**Focus on what matters. Everything else is just noise.**
