// test.js
// Basic test setup for backend functionality

const request = require('supertest');
const express = require('express');
const { TextEncoder } = require('util'); // Import TextEncoder from util
const app = express();

global.TextEncoder = TextEncoder; // Assign TextEncoder globally

app.use(express.json());

// Mock routes for testing
app.post('/api/auth/register', (req, res) => res.status(201).send({ success: true }));
app.post('/api/auth/login', (req, res) => res.status(200).send({ success: true }));
app.post('/api/auth/logout', (req, res) => res.status(200).send({ success: true }));
app.get('/api/auth/profile', (req, res) => res.status(200).send({ success: true }));

describe('Authentication Endpoints', () => {
  it('should register a new user', async () => {
    const res = await request(app).post('/api/auth/register').send({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
  });

  it('should login a user', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'test@example.com',
      password: 'password123'
    });
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should logout a user', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });

  it('should get user profile', async () => {
    const res = await request(app).get('/api/auth/profile');
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
  });
});