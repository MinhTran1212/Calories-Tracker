import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from "../index";
import prisma from '../lib/prisma';
import { Gender } from '../generated/prisma';

describe('POST /user/register', () => {
  const validPayload = {
    name: 'Minh Tran',
    email: `test_${Date.now()}@example.com`,
    password: 'Password123!',
    weight: 75,
    height: 175,
    gender: 'MALE',
    age: 22,
    workoutIntensity: 1.5,
  };

  it('should return 200 and a JWT token on valid registration', async () => {
    const res = await request(app)
      .post('/user/register')
      .send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('log');
    expect(res.body.log).toMatchObject({
      name: validPayload.name,
      email: validPayload.email,
      weight: validPayload.weight,
      height: validPayload.height,
      gender: validPayload.gender,
      age: validPayload.age,
      workoutIntensity: validPayload.workoutIntensity,
    });
    expect(res.body.log).toHaveProperty('id');
    expect(res.body.log).toHaveProperty('tdee');
  });

  it('should return 400 when required fields are missing', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({
        email: 'missingname@example.com',
        password: 'Password123!',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when gender is invalid', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({
        ...validPayload,
        email: `gender_test_${Date.now()}@example.com`,
        gender: 'OTHER',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when numeric parameters are out of range', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({
        ...validPayload,
        email: `range_test_${Date.now()}@example.com`,
        weight: 890,
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 400 when email format is invalid', async () => {
    const res = await request(app)
      .post('/user/register')
      .send({
        ...validPayload,
        email: 'not-a-valid-email',
      });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should return 500 when database operation fails', async () => {
    vi.spyOn(prisma.user, 'create').mockRejectedValueOnce(
      new Error('Database error')
    );

    const res = await request(app)
      .post('/user/register')
      .send({
        ...validPayload,
        email: `db_fail_${Date.now()}@example.com`,
      });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });
});

describe('testing POST /user/login', () => {

});

describe('testing GET /user/getprofile', () => {

});

describe('testing PATCH /user/update', () => {

});
