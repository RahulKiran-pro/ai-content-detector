// Centralized API Base URL configuration for Vercel & Render production deployment
let rawUrl = (import.meta.env.VITE_API_URL || '').trim().replace(/\/$/, '');

// Security fix: If running on HTTPS (e.g. Vercel), ensure API URL uses HTTPS protocol
if (typeof window !== 'undefined' && window.location.protocol === 'https:' && rawUrl.startsWith('http:')) {
  console.warn('[API PROTOCOL WARNING] Upgrading API URL from http:// to https:// to prevent Mixed Content blocking.');
  rawUrl = rawUrl.replace(/^http:/, 'https:');
}

export const API_BASE_URL = rawUrl;

if (typeof window !== 'undefined' && !API_BASE_URL) {
  console.info('[API CONFIG NOTE] VITE_API_URL is empty. Using relative API routes (/api). In production (Vercel), configure VITE_API_URL to point to your Render backend (e.g. https://truth-lens-backend.onrender.com).');
}
