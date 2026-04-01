#!/usr/bin/env node
/**
 * Isolated Build Script
 * 
 * This script runs the production build in complete isolation from any
 * test runner (Vitest) or development server caches. It ensures a clean
 * build environment with consistent bundle sizes.
 * 
 * Usage: node scripts/isolated-build.js
 */

import { spawnSync } from 'child_process';
import { existsSync, rmSync, readdirSync, statSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Cache directories to clear
const CACHE_DIRS = [
  '.vite',
  'node_modules/.vite',
  'node_modules/.cache',
  'node_modules/.cache/esbuild',
];

// Environment to use for isolated build
const BUILD_ENV = {
  NODE_ENV: 'production',
  // Clear potentially problematic environment variables
  VITE_FORCE_TELEMETRY: '0',
  // Use a clean npm config
  npm_config_cache: '/tmp/npm-cache-' + process.pid,
};

function clearCaches() {
  console.log('Clearing caches...');
  
  for (const cacheDir of CACHE_DIRS) {
    const fullPath = join(PROJECT_ROOT, cacheDir);
    if (existsSync(fullPath)) {
      try {
        rmSync(fullPath, { recursive: true, force: true });
        console.log(`  Cleared: ${cacheDir}`);
      } catch (err) {
        console.log(`  Warning: Could not clear ${cacheDir}: ${err.message}`);
      }
    }
  }
  
  // Also clear the dist directory
  const distPath = join(PROJECT_ROOT, 'dist');
  if (existsSync(distPath)) {
    try {
      rmSync(distPath, { recursive: true, force: true });
      console.log('  Cleared: dist');
    } catch (err) {
      console.log(`  Warning: Could not clear dist: ${err.message}`);
    }
  }
}

function runBuild() {
  console.log('\nRunning isolated build...');
  
  const result = spawnSync('npm', ['run', 'build'], {
    cwd: PROJECT_ROOT,
    encoding: 'utf-8',
    timeout: 120000,
    env: {
      ...process.env,
      ...BUILD_ENV,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  
  return {
    stdout: result.stdout || '',
    stderr: result.stderr || '',
    status: result.status,
    success: result.status === 0,
  };
}

function parseBuildOutput(output) {
  const lines = output.split('\n');
  
  // Find the main bundle (index-*.js, excluding vendor-*)
  const bundleLines = lines.filter(line => 
    line.includes('index-') && 
    line.includes('.js') && 
    !line.includes('vendor-')
  );
  
  let mainBundleSize = 0;
  let mainBundleName = '';
  
  for (const line of bundleLines) {
    const match = line.match(/([\w-]+\.js)\s+([\d.]+)\s+kB/i);
    if (match) {
      mainBundleName = match[1];
      mainBundleSize = parseFloat(match[2]);
    }
  }
  
  // If we didn't find it in the output, check the dist directory directly
  if (mainBundleSize === 0) {
    const distAssets = join(PROJECT_ROOT, 'dist', 'assets');
    if (existsSync(distAssets)) {
      const files = readdirSync(distAssets);
      const indexJsFiles = files.filter(f => 
        f.startsWith('index-') && f.endsWith('.js')
      );
      
      if (indexJsFiles.length > 0) {
        mainBundleName = indexJsFiles[0];
        const stats = statSync(join(distAssets, mainBundleName));
        mainBundleSize = stats.size / 1024;
      }
    }
  }
  
  return { mainBundleSize, mainBundleName };
}

function main() {
  console.log('=== Isolated Build Script ===\n');
  
  // Step 1: Clear all caches
  clearCaches();
  
  // Step 2: Run the build
  const buildResult = runBuild();
  
  console.log('\nBuild output:');
  console.log(buildResult.stdout);
  
  if (buildResult.stderr) {
    console.log('\nBuild stderr:');
    console.log(buildResult.stderr);
  }
  
  // Step 3: Parse and report results
  const { mainBundleSize, mainBundleName } = parseBuildOutput(buildResult.stdout);
  
  console.log('\n=== Build Results ===');
  console.log(`Status: ${buildResult.success ? 'SUCCESS' : 'FAILED'}`);
  console.log(`Main bundle: ${mainBundleName}`);
  console.log(`Main bundle size: ${mainBundleSize.toFixed(2)} KB`);
  
  // Output for test consumption
  console.log('\n=== MACHINE PARSABLE OUTPUT ===');
  console.log(`BUILD_SUCCESS=${buildResult.success}`);
  console.log(`BUNDLE_SIZE_KB=${mainBundleSize.toFixed(2)}`);
  console.log(`BUNDLE_NAME=${mainBundleName}`);
  
  process.exit(buildResult.success ? 0 : 1);
}

main();
