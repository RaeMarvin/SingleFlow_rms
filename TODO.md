# SingleFlow - TODO List

## Authentication Setup - Social Login Providers

### ✅ Completed
- [x] Google OAuth integration
- [x] Production deployment with environment variables
- [x] Supabase authentication configuration

### 🔄 Facebook Login Setup

#### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App" → Choose "Consumer" as app type
3. Fill in app details:
   - **App Name**: SingleFlow
   - **Contact Email**: Your email
   - **App Purpose**: Productivity/Task Management

#### Step 2: Configure Facebook Login
1. In your Facebook app dashboard, go to **Products** → **Facebook Login** → **Settings**
2. Add these **Valid OAuth Redirect URIs**:
   ```
   https://sitdvaawkzifvmozdrdr.supabase.co/auth/v1/callback
   https://single-flow-rms.vercel.app
   http://localhost:5173
   ```
3. **Valid Redirect URIs for Web Games**: Leave empty
4. **Client OAuth Login**: Yes
5. **Web OAuth Login**: Yes
6. **Force Web OAuth Reauthentication**: No
7. **Embedded Browser OAuth Login**: No

#### Step 3: Get App Credentials
1. Go to **Settings** → **Basic**
2. Copy your **App ID** and **App Secret**

#### Step 4: Configure Supabase
1. Go to your Supabase Dashboard → Authentication → Settings
2. Find **Auth Providers** section
3. Enable **Facebook**
4. Enter:
   - **Facebook Client ID**: Your App ID from Step 3
   - **Facebook Client Secret**: Your App Secret from Step 3
5. Click **Save**

#### Step 5: Test Facebook Login
1. Try logging in with Facebook on your production site
2. Verify user data is saved correctly in Supabase

---

### 🔄 LinkedIn Login Setup

#### Step 1: Create LinkedIn App
1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click "Create App"
3. Fill in required information:
   - **App Name**: SingleFlow
   - **LinkedIn Page**: Create a LinkedIn company page if needed
   - **App Logo**: Upload your app logo
   - **Legal Agreement**: Accept terms

#### Step 2: Configure LinkedIn OAuth
1. In your LinkedIn app dashboard, go to **Auth** tab
2. Add these **Authorized Redirect URLs**:
   ```
   https://sitdvaawkzifvmozdrdr.supabase.co/auth/v1/callback
   https://single-flow-rms.vercel.app
   http://localhost:5173
   ```
3. Under **OAuth 2.0 scopes**, request:
   - `r_liteprofile` (to retrieve basic profile info)
   - `r_emailaddress` (to retrieve email address)

#### Step 3: Get App Credentials
1. In the **Auth** tab, copy:
   - **Client ID**
   - **Client Secret**

#### Step 4: Configure Supabase
1. Go to your Supabase Dashboard → Authentication → Settings
2. Find **Auth Providers** section
3. Enable **LinkedIn**
4. Enter:
   - **LinkedIn Client ID**: Your Client ID from Step 3
   - **LinkedIn Client Secret**: Your Client Secret from Step 3
5. Click **Save**

#### Step 5: Submit for Review (if needed)
1. LinkedIn may require app review for production use
2. Submit your app with details about how you use LinkedIn data
3. Wait for approval (usually takes a few days)

#### Step 6: Test LinkedIn Login
1. Try logging in with LinkedIn on your production site
2. Verify user data is saved correctly in Supabase

---

### 🔄 Additional Improvements

#### Security Enhancements
- [ ] Add email verification requirement
- [ ] Implement password reset functionality
- [ ] Add rate limiting for login attempts
- [ ] Configure session timeout settings

#### User Experience
- [ ] Add loading states during OAuth redirects
- [ ] Improve error messages for failed logins
- [ ] Add "Remember me" functionality
- [ ] Create user profile management page

#### Analytics & Monitoring
- [ ] Add authentication analytics in Supabase
- [ ] Monitor failed login attempts
- [ ] Track user registration sources (Google/Facebook/LinkedIn/Email)

---

### 📝 Important Notes

1. **Environment Variables**: All OAuth credentials should be stored as environment variables in Vercel, never in your code
2. **Testing**: Always test OAuth flows in incognito/private browsing mode
3. **HTTPS Required**: OAuth providers require HTTPS for production apps
4. **Domain Verification**: Some providers may require domain ownership verification
5. **App Review**: Facebook and LinkedIn may require app review for certain permissions

### 🔗 Useful Links
- [Supabase Auth Providers Documentation](https://supabase.com/docs/guides/auth/social-login)
- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login/)
- [LinkedIn OAuth Documentation](https://docs.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
