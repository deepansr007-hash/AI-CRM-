/**
 * AI CRM System Deployment Suite Verification Helper
 * Run: node scripts/deploy.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const criticalDirectories = [
  'backend/src/controllers',
  'backend/src/models',
  'backend/src/services',
  'backend/src/routes',
  'backend/src/middleware',
  'backend/src/config',
  'frontend/src/components',
  'frontend/src/pages',
  'frontend/src/layouts',
  'frontend/src/services',
  'frontend/src/hooks',
  'frontend/src/styles',
  'ai-engine/models',
  'ai-engine/pipelines',
  'ai-engine/inference',
  'database/migrations',
  'database/seeders',
  'database/queries',
  'docs',
  'config'
];

console.log('--- STARTING CRM DEPLOYMENT INTEGRITY CHECKS ---');
let hasErrors = false;

criticalDirectories.forEach(dir => {
  const fullPath = path.resolve(rootDir, dir);
  if (fs.existsSync(fullPath)) {
    console.log(`✅ Directory present: ${dir}`);
  } else {
    console.log(`❌ Directory MISSING: ${dir}`);
    hasErrors = true;
  }
});

console.log('------------------------------------------------');
if (hasErrors) {
  console.log('❌ Project directory checks failed. Fix missing structures before registry fit.');
  process.exit(1);
} else {
  console.log('🎉 Project integrity checklist successfully passed!');
  process.exit(0);
}
