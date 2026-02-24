# Testing Instructions - Authentication System

## What Was Fixed

1. **Mobile Signup Button** - Added Sign Up and Login buttons to mobile bottom navigation
2. **Dashboard Protection** - Enhanced protection logic to require authentication on all dashboards
3. **Refresh Handling** - Dashboards now properly verify authentication on page refresh
4. **Database Setup** - Created profiles table with role-based access control

## Testing Steps

### Test 1: Mobile Navigation (Phone View)
1. Open `landing_page.html` in browser
2. Resize browser window to mobile width (< 768px) OR use browser dev tools mobile view
3. Scroll down - you should see bottom navigation bar
4. Verify you see 5 buttons: Home, Features, Pricing, Sign Up, Login
5. Click "Sign Up" - auth modal should open with signup form
6. Click "Login" - auth modal should open with login form

### Test 2: Sign Up Flow
1. On landing page, click any "Join Network" or "Sign Up" button
2. Fill in the signup form:
   - First Name: Test
   - Last Name: User
   - Email: testuser@example.com
   - Password: TestPass123!
3. Watch password strength indicator change as you type
4. Click "Create Account →"
5. You should see "Creating your account…" toast
6. Then "Success! Redirecting..." toast
7. Should automatically redirect to `client_dashboard.html`

### Test 3: Dashboard Protection (Unauthenticated)
1. Open a new incognito/private browser window
2. Try to directly access: `client_dashboard.html`
3. Should immediately redirect to `landing_page.html`
4. Try accessing: `admin_dashboard.html`
5. Should immediately redirect to `landing_page.html`
6. Try accessing: `developer_dashboard.html`
7. Should immediately redirect to `landing_page.html`

### Test 4: Sign In Flow
1. From landing page, click "Client Area" or "Sign In"
2. Enter credentials:
   - Email: testuser@example.com
   - Password: TestPass123!
3. Click "Sign In →"
4. Should see "Signing you in…" toast
5. Then "Success! Redirecting..." toast
6. Should redirect to `client_dashboard.html`

### Test 5: Dashboard Refresh
1. While logged in on `client_dashboard.html`
2. Press F5 or refresh the page
3. Should stay on `client_dashboard.html` (not redirect to landing)
4. Open browser console (F12) - should see:
   - "[INFO] Supabase client initialized."
   - "[DEBUG] Protecting dashboard..."
   - "[INFO] User authenticated, verifying dashboard access..."
   - "[INFO] Dashboard access verified for client_dashboard.html"

### Test 6: Role-Based Access
1. Log in as a client user
2. Try to navigate to `admin_dashboard.html`
3. Should automatically redirect back to `client_dashboard.html`
4. Check console - should see:
   - "[WARN] User on wrong dashboard. Redirecting from admin_dashboard.html to client_dashboard.html"

### Test 7: Sign Out
1. While logged in on any dashboard
2. Find and click the "Sign Out" button (location varies by dashboard)
3. Should redirect to `landing_page.html`
4. Try to access dashboard again
5. Should redirect to landing page (proving session ended)

### Test 8: Session Persistence
1. Sign in successfully
2. Close browser tab
3. Open new tab and navigate to `client_dashboard.html`
4. Should load successfully without redirect (session persists)
5. Navigate to `landing_page.html`
6. Should automatically redirect to dashboard (already logged in)

### Test 9: Google OAuth (Requires Configuration)
**Note:** Google OAuth must be configured in Supabase dashboard first
1. On landing page, click any auth button
2. Click "Continue with Google"
3. Should redirect to Google sign-in page
4. Sign in with Google account
5. Should redirect back and create profile
6. Should land on `client_dashboard.html`

### Test 10: Different User Roles
To test different roles, you need to manually update the database:

1. Sign up a new user
2. Go to Supabase Dashboard → Table Editor → profiles
3. Find the user's row
4. Change `role` column from `client` to `admin`
5. User must sign out and sign back in
6. Should now land on `admin_dashboard.html` instead

Test each role:
- `client` → `client_dashboard.html`
- `admin` → `admin_dashboard.html`
- `developer` → `developer_dashboard.html`
- `commissioner` → `sales_dashboard.html`

## Console Logging

When testing, keep browser console (F12) open to see detailed logs:

**Good Sign-In Flow:**
```
[INFO] Supabase client initialized.
[DEBUG] Auth Event: SIGNED_IN
[INFO] User session detected, checking dashboard for role...
[DEBUG] Redirect check: Current = landing_page.html, Target = client_dashboard.html
[INFO] Redirecting to client_dashboard.html
```

**Good Dashboard Protection:**
```
[DEBUG] Protecting dashboard...
[INFO] User authenticated, verifying dashboard access...
[DEBUG] Current page: client_dashboard.html, Expected: client_dashboard.html
[INFO] Dashboard access verified for client_dashboard.html
```

**Blocked Access:**
```
[WARN] No active session found. User must sign in.
[INFO] Redirecting unauthenticated user from client_dashboard.html to landing page
```

## Common Issues & Solutions

### Issue: "Invalid login credentials"
**Solution:**
- Verify email and password are correct
- Passwords are case-sensitive
- Make sure account was created successfully

### Issue: Dashboard shows loading spinner forever
**Solution:**
- Check browser console for errors
- Verify Supabase credentials in `supabase-client.js` are correct
- Check internet connection

### Issue: Redirect loop (keeps redirecting)
**Solution:**
- Clear browser cache and cookies
- Sign out completely
- Close all tabs and try again

### Issue: Mobile buttons don't appear
**Solution:**
- Resize browser to less than 768px width
- Use browser dev tools mobile emulator
- Scroll down to see bottom navigation

### Issue: Google OAuth doesn't work
**Solution:**
- Verify Google OAuth is enabled in Supabase Dashboard
- Check that Client ID and Secret are configured
- Ensure redirect URI is set in Google Console

## Expected Behavior Summary

✅ **Landing Page:**
- Shows auth modal when clicking auth buttons
- Redirects to dashboard if already logged in
- Mobile bottom nav shows Sign Up and Login buttons

✅ **Dashboards:**
- Require authentication (redirect to landing if not logged in)
- Verify correct role (redirect to correct dashboard if wrong one)
- Persist session on refresh
- Show user information from profile

✅ **Authentication:**
- Sign up creates profile with default 'client' role
- Sign in validates credentials and redirects
- Sign out clears session and redirects to landing
- Session persists across browser tabs

✅ **Security:**
- Cannot access dashboards without authentication
- Cannot access wrong dashboard (role-based routing)
- RLS policies protect database access
- Roles can only be changed via database (not by users)

## Files Modified

1. `landing_page.html` - Added Sign Up and Login buttons to mobile nav
2. `supabase-client.js` - Enhanced dashboard protection logic
3. Database - Created `profiles` table with migration

## Next Steps

After testing, you can:
1. Customize dashboard content for each role
2. Add user profile editing functionality
3. Configure Google OAuth for one-click sign-in
4. Add password reset functionality
5. Add email verification (optional)

## Support

If you encounter issues:
1. Check browser console (F12) for error messages
2. Review the console logs to understand the flow
3. Verify database migration was applied successfully
4. Check that `supabase-client.js` credentials are correct
