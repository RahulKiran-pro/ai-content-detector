/**
 * Environment Variables Startup Validation Module
 * Validates configuration without crashing the server process.
 */

function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  
  const requiredKeys = ['MONGODB_URI', 'JWT_SECRET'];
  const missingKeys = [];

  requiredKeys.forEach((key) => {
    const val = process.env[key];
    if (!val || val.includes('placeholder') || val.includes('your_')) {
      missingKeys.push(key);
    }
  });

  if (missingKeys.length > 0) {
    console.warn('\n========================================================');
    console.warn('⚠️ ENVIRONMENT NOTICE: Missing or Placeholder Configuration');
    console.warn('========================================================');
    missingKeys.forEach((key) => console.warn(`  - ${key}`));
    console.warn('Backend running with dev fallback keys. Ensure environment variables');
    console.warn('are configured in your Render dashboard for production deployment.');
    console.warn('========================================================\n');
  } else {
    console.log('[CONFIG SUCCESS] Essential environment variables verified.');
  }
}

module.exports = { validateEnv };
