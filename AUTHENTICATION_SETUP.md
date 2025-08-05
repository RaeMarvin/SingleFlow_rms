# SingleFlow Authentication Setup Guide

## Setting Up Social Authentication in Supabase

After running the database schema, you need to configure social authentication providers in your Supabase dashboard.

### 1. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add authorized redirect URIs:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
7. Copy the Client ID and Client Secret

**In Supabase Dashboard:**
1. Go to Authentication → Providers
2. Enable Google
3. Paste Client ID and Client Secret
4. Save configuration

### 2. Facebook OAuth Setup

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select existing one
3. Add Facebook Login product
4. In Facebook Login settings, add Valid OAuth Redirect URIs:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
5. Copy App ID and App Secret

**In Supabase Dashboard:**
1. Go to Authentication → Providers
2. Enable Facebook
3. Paste App ID and App Secret
4. Save configuration

### 3. LinkedIn OAuth Setup

1. Go to [LinkedIn Developers](https://developer.linkedin.com/)
2. Create a new app
3. Add "Sign In with LinkedIn" product
4. In Auth tab, add Authorized redirect URLs:
   - `https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback`
5. Copy Client ID and Client Secret

**In Supabase Dashboard:**
1. Go to Authentication → Providers
2. Enable LinkedIn (OIDC)
3. Paste Client ID and Client Secret
4. Save configuration

### 4. Update Site URL (Important!)

In Supabase Dashboard:
1. Go to Authentication → URL Configuration
2. Add your site URL (e.g., `http://localhost:3000` for development - check your terminal to confirm the exact port)
3. **For now, just use your development URL** - you can add production URLs later when you deploy
4. When you're ready to deploy, come back and add your production domain:
   - **Vercel**: `https://your-app-name.vercel.app`
   - **Netlify**: `https://your-app-name.netlify.app`
   - **Custom Domain**: `https://yourdomain.com`
   - **GitHub Pages**: `https://yourusername.github.io/singleflow`
   - **Firebase Hosting**: `https://your-project.web.app`

### 5. Run the Database Schema

Make sure to run the complete database schema in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of complete-supabase-schema.sql
-- This will create tables with proper foreign key constraints to auth.users
```

### 6. Test Authentication

1. Start your development server: `npm run dev`
2. Click "Sign In" button
3. Try signing in with Google, Facebook, or LinkedIn
4. Check that user data is properly stored in your database

### Security Notes

- The app uses Row Level Security (RLS) to ensure users can only access their own data
- User IDs are now properly linked to Supabase Auth users
- All social providers redirect back to your app after authentication
- Email/password authentication is also available as a fallback

### Troubleshooting

**Common Issues:**
1. **Invalid redirect URI**: Make sure all redirect URIs match exactly in both the provider and Supabase
2. **CORS errors**: Ensure your site URL is properly configured in Supabase
3. **Missing scopes**: Some providers require specific scopes for email/profile access
4. **Development vs Production**: Use different OAuth apps for development and production environments

**Environment Variables:**
The app uses your Supabase project URL and anon key from your existing `.env` file. No additional environment variables are needed for social authentication.
