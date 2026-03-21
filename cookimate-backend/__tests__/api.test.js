// __tests__/api.test.js
// @ts-nocheck
import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../app.js';  // ← Using app.js instead of server.js

describe('CookiMate API Tests', () => {
    
    // Test 1: Simple verification that Jest works
    test('Jest is working with ES6 modules', () => {
        expect(true).toBe(true);
        console.log('✓ Jest test framework is working');
    });
    
    // Test 2: Check if app is defined
    test('Server app is properly exported', () => {
        expect(app).toBeDefined();
        console.log('✓ Server app is defined and exported');
    });
    
    // Test 3: Test the root endpoint
    test('GET / - should return welcome message', async () => {
        const response = await request(app)
            .get('/')
            .timeout(5000);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.message).toBe('CookiMate API is running');
        console.log('✓ Root endpoint test passed');
    });
    
    // Test 4: Test health check endpoint
    test('GET /health - should return OK status', async () => {
        const response = await request(app)
            .get('/health')
            .timeout(5000);
        
        expect(response.statusCode).toBe(200);
        expect(response.body.status).toBe('OK');
        console.log('✓ Health check test passed');
    });
});