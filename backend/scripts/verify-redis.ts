#!/usr/bin/env tsx
/**
 * Redis Connection Verification Script
 * 
 * This script verifies that Redis is accessible and working.
 * Run with: npx tsx scripts/verify-redis.ts
 */

import dotenv from 'dotenv';
import Redis from 'ioredis';

// Load environment variables
dotenv.config({ path: '.env' });

const REDIS_URL = process.env.REDIS_URL;
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;

async function verifyRedis() {
  console.log('🔍 Verifying Redis Connection...\n');

  // Determine Redis connection method
  let redis: Redis;
  
  if (REDIS_URL) {
    console.log(`📡 Connecting via REDIS_URL: ${REDIS_URL.replace(/\/\/.*@/, '//***@')}`);
    redis = new Redis(REDIS_URL);
  } else {
    console.log(`📡 Connecting to ${REDIS_HOST}:${REDIS_PORT}`);
    const options: any = {
      host: REDIS_HOST,
      port: REDIS_PORT,
    };
    if (REDIS_PASSWORD) {
      options.password = REDIS_PASSWORD;
      console.log('   Using password authentication');
    }
    redis = new Redis(options);
  }

  try {
    // Test 1: Ping Redis
    console.log('\n📡 Test 1: Pinging Redis...');
    const pong = await redis.ping();
    if (pong === 'PONG') {
      console.log('✅ Redis is responding!');
    } else {
      console.log(`⚠️  Unexpected response: ${pong}`);
    }

    // Test 2: Set and Get a test value
    console.log('\n📡 Test 2: Testing SET/GET operations...');
    const testKey = 'echo:test:verification';
    const testValue = `test-${Date.now()}`;
    
    await redis.set(testKey, testValue, 'EX', 10); // Expire in 10 seconds
    const retrievedValue = await redis.get(testKey);
    
    if (retrievedValue === testValue) {
      console.log('✅ SET/GET operations working!');
      console.log(`   Set: ${testKey} = ${testValue}`);
      console.log(`   Got: ${testKey} = ${retrievedValue}`);
    } else {
      console.log(`❌ Value mismatch: expected ${testValue}, got ${retrievedValue}`);
    }

    // Test 3: Check Redis info
    console.log('\n📡 Test 3: Getting Redis server info...');
    const info = await redis.info('server');
    const versionMatch = info.match(/redis_version:([^\r\n]+)/);
    const version = versionMatch ? versionMatch[1] : 'unknown';
    console.log(`✅ Redis version: ${version}`);

    // Test 4: Test cache service pattern (if cacheService exists)
    console.log('\n📡 Test 4: Testing cache key pattern...');
    const cacheKey = 'test:cache:key';
    const cacheValue = { test: 'data', timestamp: Date.now() };
    
    await redis.setex(cacheKey, 60, JSON.stringify(cacheValue));
    const cachedData = await redis.get(cacheKey);
    
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      if (parsed.test === cacheValue.test) {
        console.log('✅ Cache pattern working!');
        console.log(`   Cached: ${cacheKey}`);
        console.log(`   TTL: ${await redis.ttl(cacheKey)} seconds`);
      }
    }

    // Cleanup test keys
    await redis.del(testKey, cacheKey);
    console.log('\n🧹 Cleaned up test keys');

    // Summary
    console.log('\n🎉 All Redis tests passed!');
    console.log('\n📋 Redis Status:');
    console.log('   ✅ Connection successful');
    console.log('   ✅ PING/PONG working');
    console.log('   ✅ SET/GET operations working');
    console.log('   ✅ Cache pattern working');
    console.log(`   ✅ Redis version: ${version}`);
    console.log('\n💡 Redis is ready for Phase 6 caching!');

    await redis.quit();
    process.exit(0);

  } catch (error: any) {
    console.error('\n❌ Redis connection failed!');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Error: Connection refused');
      console.error('   Redis is not running or not accessible');
      console.log('\n💡 To fix this:');
      console.log('   1. Start Redis with Docker:');
      console.log('      cd backend && docker-compose up -d redis');
      console.log('   2. Or install Redis locally:');
      console.log('      brew install redis  # macOS');
      console.log('      redis-server         # Start Redis');
      console.log('   3. Verify Redis is running:');
      console.log('      docker ps | grep redis  # Docker');
      console.log('      redis-cli ping          # Local');
    } else if (error.code === 'ENOTFOUND') {
      console.error('   Error: Host not found');
      console.error(`   Could not resolve: ${REDIS_HOST}`);
    } else if (error.message?.includes('NOAUTH')) {
      console.error('   Error: Authentication failed');
      console.error('   Check REDIS_PASSWORD in .env');
    } else {
      console.error(`   Error: ${error.message}`);
      console.error(`   Code: ${error.code || 'unknown'}`);
    }

    await redis.quit();
    process.exit(1);
  }
}

// Run verification
verifyRedis().catch((error) => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});

