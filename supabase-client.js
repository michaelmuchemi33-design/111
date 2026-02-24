// supabase-client.js
const SUPABASE_URL = 'https://smdbfaomeghoejqqkplv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNtZGJmYW9tZWdob2VqcXFrcGx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1OTY4MDEsImV4cCI6MjA4NzE3MjgwMX0.HuQdEt6Knr7_MgYt2B_QiUbls2hy8SMPZlSxe5KPTqU';

// Centralized Logger
window._L = {
  info: (msg, data) => console.log(`%c[INFO] ${msg}`, 'color: #7DC870; font-weight: bold;', data || ''),
  warn: (msg, data) => console.warn(`%c[WARN] ${msg}`, 'color: #EAB308; font-weight: bold;', data || ''),
  error: (msg, data) => console.error(`%c[ERROR] ${msg}`, 'color: #EF4444; font-weight: bold;', data || ''),
  debug: (msg, data) => console.debug(`%c[DEBUG] ${msg}`, 'color: #60A5FA;', data || '')
};

// Wait for Supabase to be loaded via CDN
function initSupabaseAuth() {
  if (!window.supabase) {
    console.error('Supabase library not loaded. Ensure script is included via CDN.');
    return null;
  }
  return window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

window.sbClient = initSupabaseAuth();
if (window.sbClient) _L.info("Supabase client initialized.");
else _L.error("Failed to initialize Supabase client.");

async function getDashboardForRole(session) {
  if (!window.sbClient || !session?.user) return 'client_dashboard.html';

  const { data: profile, error } = await window.sbClient
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();

  if (error || !profile) {
    console.warn("Could not fetch user role, defaulting to client.");
    return 'client_dashboard.html';
  }

  switch (profile.role) {
    case 'admin': return 'admin_dashboard.html';
    case 'commissioner': return 'sales_dashboard.html';
    case 'developer': return 'developer_dashboard.html';
    case 'client': default: return 'client_dashboard.html';
  }
}

async function handleAuthRedirect(session) {
  if (session && session.user) {
    _L.info("User session detected, checking dashboard for role...", { email: session.user.email });
    const dashboard = await getDashboardForRole(session);
    const currentPage = window.location.pathname.split('/').pop();

    _L.debug(`Redirect check: Current = ${currentPage}, Target = ${dashboard}`);

    // Prevent redirect loop if already on the correct dashboard
    if (currentPage !== dashboard) {
      _L.info(`Redirecting to ${dashboard}`);
      window.location.href = dashboard;
    }
  }
}

// Global function to protect dashboard pages
async function protectDashboard() {
  if (!window.sbClient) return;

  const { data: { session }, error } = await window.sbClient.auth.getSession();
  if (error || !session) {
    // If not authenticated and not on landing page, redirect to landing page
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== 'landing_page.html' && currentPage !== '') {
      window.location.href = 'landing_page.html';
    }
  } else {
    // Make sure the user is allowed to access this dashboard
    const dashboard = await getDashboardForRole(session);
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage !== dashboard && currentPage !== 'landing_page.html' && currentPage !== '') {
      // If trying to access a different dashboard without permission
      window.location.href = dashboard;
    }
  }
}

// Global function to redirect if heavily logged in
async function redirectIfLoggedIn() {
  if (!window.sbClient) return;
  const { data: { session }, error } = await window.sbClient.auth.getSession();
  if (session) {
    handleAuthRedirect(session);
  }
}

// Use google auth configuration
async function initiateGoogleAuth() {
  if (!window.sbClient) {
    _L.error("Supabase client not initialized");
    if (window.showToast) window.showToast('Authentication system not ready. Please refresh.');
    return;
  }

  _L.info("Initiating Google OAuth...");
  const { data, error } = await window.sbClient.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + '/landing_page.html',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      }
    }
  });

  if (error) {
    _L.error("Google OAuth error:", error);
    if (window.showToast) window.showToast('Authentication failed. Please try again.');
  } else {
    _L.info("Google OAuth initiated successfully");
  }
}

// Global function to sign out
async function signOut() {
  if (!window.sbClient) return;
  const { error } = await window.sbClient.auth.signOut();
  if (error) {
    console.error('Error signing out:', error.message);
  } else {
    window.location.href = 'landing_page.html';
  }
}

// Listener for auth state changes
if (window.sbClient) {
  window.sbClient.auth.onAuthStateChange(async (event, session) => {
    _L.debug(`Auth Event: ${event}`, { sessionSet: !!session });

    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'landing_page.html' || currentPage === '') {
        await handleAuthRedirect(session);
      }
    } else if (event === 'SIGNED_OUT') {
      _L.info("User signed out, redirecting to landing page.");
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage !== 'landing_page.html' && currentPage !== '') {
        window.location.href = 'landing_page.html';
      }
    }
  });
}

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  // Specifically for admin which uses a class
  if (savedTheme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
}

function setTheme(theme) {
  localStorage.setItem('theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
  if (theme === 'light') {
    document.documentElement.classList.add('light');
  } else {
    document.documentElement.classList.remove('light');
  }
}

// Loading States
const loaderCss = `
.loading-overlay {
  position: fixed;
  inset: 0;
  background: var(--bg-page, #0A0A0A);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: opacity 0.4s ease;
}
.loading-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}
.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255,255,255,0.1);
  border-top-color: var(--accent, #7DC870);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
[data-theme="light"] .spinner {
  border: 3px solid rgba(0,0,0,0.05);
  border-top-color: var(--accent, #3d8c18);
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
`;

function injectLoader() {
  const style = document.createElement('style');
  style.innerHTML = loaderCss;
  document.head.appendChild(style);

  const loader = document.createElement('div');
  loader.id = 'global-loader';
  loader.className = 'loading-overlay';
  loader.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loader);
}

function hideLoader() {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.classList.add('hidden');
    setTimeout(() => loader.remove(), 400);
  }
}

// Auto-inject for dashboards
const isDashboard = window.location.pathname.includes('_dashboard.html');
if (isDashboard) {
  window.addEventListener('DOMContentLoaded', injectLoader);
}

// Initialize theme on load
initTheme();

// Toast Notifications
const toastCss = `
.global-toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0,0,0,0.85);
  color: #fff;
  padding: 10px 18px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  z-index: 10000;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.3);
  backdrop-filter: blur(8px);
  animation: toast-in 0.3s ease;
}
[data-theme="light"] .global-toast {
  background: rgba(255,255,255,0.95);
  color: #000;
  border: 1px solid rgba(0,0,0,0.05);
}
@keyframes toast-in {
  from { transform: translate(-50%, 20px); opacity: 0; }
  to { transform: translate(-50%, 0); opacity: 1; }
}
`;

function showToast(msg, duration = 3000) {
  let style = document.getElementById('global-toast-style');
  if (!style) {
    style = document.createElement('style');
    style.id = 'global-toast-style';
    style.innerHTML = toastCss;
    document.head.appendChild(style);
  }

  const t = document.createElement('div');
  t.className = 'global-toast';
  t.innerHTML = msg;
  document.body.appendChild(t);

  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translate(-50%, 10px)';
    t.style.transition = 'all 0.4s ease';
    setTimeout(() => t.remove(), 400);
  }, duration);
}

window.showToast = showToast;
