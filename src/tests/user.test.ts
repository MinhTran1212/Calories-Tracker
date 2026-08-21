import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from "../index";
import prisma from '../lib/prisma';
import { Gender } from '../generated/prisma';
import jwt from 'jsonwebtoken';

describe('testing POST /user/register', () => {
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
    let email: string;
    const password = 'Password123!';

    beforeAll(async () => {
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

        const res = await request(app)
            .post('/user/register')
            .send(validPayload);
        
        email = res.body.log.email;
    });

    it('should return 200 and return token', async () => {
        const login = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password
            })

        expect(login.status).toBe(200);
        expect(login.body).toHaveProperty('token');
        expect(login.body).toHaveProperty('user');
        expect(login.body.user).toMatchObject({
            id: expect.any(Number),
            email: email,
        });
    });
    it('should return 400 when email or password is missing', async () => {
        const login = await request(app)
            .post('/user/login')
            .send({
                email: email,
            });

        expect(login.status).toBe(400);
        expect(login.body).toHaveProperty('error');
    });

    it('should return 401 when given invalid password', async () => {
        const login = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: 'WrongPassword123!',
            });

        expect(login.status).toBe(401);
        expect(login.body).toHaveProperty('error');
    });

    it('should return 401 when given an unregistered email', async () => {
        const login = await request(app)
            .post('/user/login')
            .send({
                email: 'nonexistent_user@example.com',
                password: password,
            });

        expect(login.status).toBe(401);
        expect(login.body).toHaveProperty('error');
    });

    it('should return 500 when database fails', async () => {
        vi.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(
            new Error('Database query failure')
        );

        const login = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password,
            });

        expect(login.status).toBe(500);
        expect(login.body).toHaveProperty('error');
    });
});

describe('testing GET /user/getprofile', () => {
    let token: string;

    beforeAll( async () => {
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

        const res = await request(app)
            .post('/user/register')
            .send(validPayload);
        
        token = res.body.token;
        
    });

    it('should return 200 and json', async () => {
        const res = await request(app)
            .get('/user/getprofile')
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            "id": expect.any(Number),
            "email": expect.any(String),
            "name": expect.any(String),
            "tdee": expect.any(Number),
            "weight": expect.any(Number),
            "height": expect.any(Number),
            "gender": expect.stringMatching(/^(MALE|FEMALE)$/),
            "age": expect.any(Number),
            "workoutIntensity": expect.any(Number)
        });
    });

    it('should return 401 when token is missing', async () => {
        const res = await request(app)
            .get('/user/getprofile');

        expect(res.status).toBe(401);
    });

    it('should return 404 when user does not exist in the database', async () => {
        const nonExistentUserToken = jwt.sign(
            { userId: 999999 },
            process.env.JWT_SECRET || 'testsecret',
            { expiresIn: '1h' }
        );

        const res = await request(app)
            .get('/user/getprofile')
            .set('Authorization', `Bearer ${nonExistentUserToken}`);

        expect(res.status).toBe(404);
        expect(res.body).toHaveProperty('error');
    });

    it('should return 500 when database query fails', async () => {
        vi.spyOn(prisma.user, 'findUnique').mockRejectedValueOnce(
            new Error('Database query failure')
        );

        const res = await request(app)
            .get('/user/getprofile')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('testing PATCH /user/update', () => {
    let token: string;

    beforeAll(async () => {
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

        const res = await request(app)
            .post('/user/register')
            .send(validPayload);

        token = res.body.token;
    });

    it('should return 200 and json of the new profile', async () => {
        const update = await request(app)
            .patch('/user/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'Dau Buoi Re Rach'
            })

        const res = await request(app)
            .get('/user/getprofile')
            .set('Authorization', `Bearer ${token}`);

        expect(update.status).toBe(200);
        expect(res.body.name).toBe('Dau Buoi Re Rach');
    });

    it('should return 400 because of invalid parameters', async () => {
        const update = await request(app)
            .patch('/user/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 123
            })

        expect(update.status).toBe(400);
    });

        it('should return 400', async () => {
        const update = await request(app)
            .patch('/user/update')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 123
            })

        expect(update.status).toBe(400);
    });

    it('should return 401 because of unauthorized', async () => {
        const update = await request(app)
            .patch('/user/update')
            .send({
                name: "DBRR"
            })

        expect(update.status).toBe(401);
    });

    it('should return 500 when database query fails', async () => {
        vi.spyOn(prisma.user, 'update').mockRejectedValueOnce(
            new Error('Database query failure')
        );

        const res = await request(app)
            .patch('/user/update')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});
