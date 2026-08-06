/**
 * Production Environment Variables Validation Module
 * Ensures essential configuration keys are set before server startup.
 */

function validateEnv() {
  const isProduction = process.env.NODE_ENV === 'production';
  const requiredVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'TRUTHSCAN_API_KEY'
  ];

  const optionalVars = [
    'PORT',
    'EMAIL_HOST',
    'EMAIL_USER',
    'EMAIL_PASS',
    'CLIENT_URL',
    'GOOGLE_CLIENT_ID'
  ];

  const missingRequired = requiredVars.filter((varName) => {
    const val = process.env[varName];
    return !val || val.includes('your_') || val.includes('placeholder');
  });

  if (missingRequired.length > 0) {
    console.error('\n========================================================');
    console.error('🚨 ENVIRONMENT CONFIGURATION ERROR');
    console.error('========================================================');
    console.error('The following required environment variables are missing or invalid:');
    missingRequired.forEach((name) => console.error(`  - ${name}`));
    console.error('========================================================\n');

    if (isProduction) {
      console.error('Fatal: Halting server startup in production due to missing environment configuration.');
      process.exit(1);
    } else {
      console.warn('⚠️ Warning: Running in development mode with fallback configurations.');
    }
  }

  // Warn about optional services
  const missingOptional = optionalVars.filter((v) => !process.env[v]);
  if (missingOptional.length > 0 && !isProduction) {
    console.log(`[Config Note] Optional variables not set: ${missingOptional.join(', ')}`);
  }
}

module.exports = { validateEnv };
