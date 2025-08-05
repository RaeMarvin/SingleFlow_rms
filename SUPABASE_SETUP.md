# 🚀 Supabase Integration Setup Guide

Your SingleFlow app now supports **persistent cloud storage** with Supabase! Follow these steps to set up your database and connect your app.

## 📋 Prerequisites

1. **Supabase Account** - Sign up at [https://supabase.com](https://supabase.com)
2. **Your SingleFlow app** - Already set up ✅

## 🔧 Setup Steps

### Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Click **"New Project"**
3. Choose your organization
4. Enter project details:
   - **Name**: `SingleFlow` or any name you prefer
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your location
5. Click **"Create new project"**
6. Wait for setup to complete (~2 minutes)

### Step 2: Set Up Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-schema.sql` (in your project root)
3. Paste it into the SQL Editor
4. Click **"Run"** to create all tables and indexes

### Step 3: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://abcdefghijk.supabase.co`)
   - **anon/public key** (starts with `eyJhbGciOiJIUzI1NiI...`)

### Step 4: Configure Environment Variables

1. Open your `.env.local` file in VS Code
2. Replace the placeholder values with your actual credentials:

```env
# Replace these with your actual Supabase values:
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...your-anon-key
```

⚠️ **Important**: Make sure there are no spaces around the `=` signs!

### Step 5: Restart Your App

1. Stop the development server (Ctrl+C in terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

## ✅ Test Your Setup

1. **Create a task** - Add a new task in your app
2. **Check Supabase** - Go to **Table Editor** → **tasks** to see your data
3. **Refresh browser** - Your tasks should persist across page reloads
4. **Try different devices** - Access your app from another device (same tasks!)

## 🔄 Data Migration

Your existing localStorage data will remain, but new data will be stored in Supabase. The app will automatically:

- ✅ Load existing tasks from Supabase on startup
- ✅ Save all new tasks/ideas to Supabase
- ✅ Sync changes in real-time
- ✅ Work offline with optimistic updates

## 🌟 Features You Now Have

- **☁️ Cloud Storage** - Access your data from anywhere
- **🔄 Real-time Sync** - Changes save automatically
- **📱 Multi-device** - Use on phone, tablet, laptop
- **🔒 Secure** - Your data is protected with Supabase security
- **⚡ Fast** - Optimistic updates for instant feedback
- **📊 Analytics Ready** - Query your productivity data anytime

## 🔧 Advanced Configuration (Optional)

### Custom Database Tables
You can modify the tables in Supabase's **Table Editor** if you want to add custom fields.

### Row Level Security
For production use, consider setting up Supabase Auth and proper RLS policies.

### Backup
Your data is automatically backed up by Supabase, but you can export it anytime from the dashboard.

## 🐛 Troubleshooting

### "Missing Supabase environment variables" Error
- Double-check your `.env.local` file has the correct values
- Ensure there are no extra spaces
- Restart the development server

### Tasks not saving
- Check browser console for errors
- Verify your Supabase project is active
- Check your API key permissions

### Can't see data in Supabase
- Ensure the SQL schema was run successfully
- Check the **Table Editor** for your tables
- Verify data is being sent (check Network tab in DevTools)

## 🎉 You're Done!

Your SingleFlow app now has persistent cloud storage! Your productivity data will never be lost and you can access it from anywhere.

**Next Steps:**
- Use your app daily to track Signal vs Noise tasks
- Check your productivity trends in the Daily Review
- Access your data from multiple devices

Happy focusing! 🎯
