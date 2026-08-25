import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from "../index";
import prisma from '../lib/prisma';

describe('testing POST /food/create', () => {
    let token: string;
    let userId: number;
    let email: string;
    let password = 'Password123!';
    let testFoodId = Number;

    beforeAll(async() => {
        const validPayload = {
            name: 'Minh Tran',
            email: `test_${Date.now()}@example.com`,
            password: 'Password123!',
            weight: 75,
            height: 175,
            gender: 'MALE',
            age: 22,
            workoutIntensity: 1.5
        };

        const res = await request(app)
            .post('/user/register')
            .send(validPayload)

        email = res.body.log.email;

        const authRes = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password
            });

        token = authRes.body.token;
        userId = authRes.body.user.id;
        const foodRes = await request(app)
            .post('/food/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
              name: 'Chicken Breast',
              protein: 31,
              carb: 0,
              fat: 3.6,
              fiber: 0,
              quantity: 100,
      });

        testFoodId = foodRes.body.id;
    });

    it('should return json and 200', async () => {
        const res = await request(app)
            .post('/food/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "dog meat",
                protein: 20,
                carb: 0,
                fat: 5,
                fiber: 0,
                quantity: 100 
            })

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: expect.any(Number),
            name: "dog meat",
            protein: 20,
            carb: 0,
            fat: 5,
            fiber: 0,
            calories: expect.any(Number),
            grams: expect.any(Number),
            userId: userId
        })
    });

    it('should return 401 due to no authorization', async() => {
        const res = await request(app)
        .post('/food/create')
        .send({
            name: "dog meat",
            protein: 20,
            carb: 0,
            fat: 5,
            fiber: 0,
            quantity: 100 
        })

        expect(res.status).toBe(401);
    })

    it('should return 400 due to invalid input', async () => {
        const res = await request(app)
            .post('/food/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: "dog meat",
                protein: 20,
                carb: 0,
                fat: -5,
                fiber: 0,
                quantity: 100 
            })

        expect(res.status).toBe(400);
    });

    it('should return 500 due to database internal failure', async() => {
        vi.spyOn(prisma.food, 'create').mockRejectedValueOnce(
            new Error('Database connection failed')
        );
        const res = await request(app)
        .post('/food/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
            name: "dog meat",
            protein: 20,
            carb: 0,
            fat: 5,
            fiber: 0,
            quantity: 100 
        })
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('GET /food/all', () => {
    it('should return 200 and a list of all foods', async () => {
      const res = await request(app).get('/food/all');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 500 when database fails', async () => {
      vi.spyOn(prisma.food, 'findMany').mockRejectedValueOnce(
        new Error('Database query failure')
      );

      const res = await request(app).get('/food/all');

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
});

describe('GET /food/search', () => {
    let token: string;
    let userId: number;
    let email: string;
    let password = 'Password123!'

    beforeAll(async() => {
        const validPayload = {
            name: 'Minh Tran',
            email: `test_${Date.now()}@example.com`,
            password: 'Password123!',
            weight: 75,
            height: 175,
            gender: 'MALE',
            age: 22,
            workoutIntensity: 1.5
        };

        const res = await request(app)
            .post('/user/register')
            .send(validPayload)

        email = res.body.log.email;

        const authRes = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password
            });

        token = authRes.body.token;
        userId = authRes.body.user.id;
    });

    it('should return 200 and matching search results', async () => {
      const res = await request(app)
        .get('/food/search?q=Chicken')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('foods');
      expect(Array.isArray(res.body.foods)).toBe(true);
    });

    it('should return 400 when query parameter "q" is missing', async () => {
      const res = await request(app)
        .get('/food/search')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 401 when token is missing', async () => {
      const res = await request(app).get('/food/search?q=salmon');

      expect(res.status).toBe(401);
    });

    it('should return 500 when database fails', async () => {
      vi.spyOn(prisma.food, 'findMany').mockRejectedValueOnce(
        new Error('Database search failure')
      );

      const res = await request(app)
        .get('/food/search?q=Chicken')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
});

describe('GET /food/:id', () => {
    let token: string;
    let userId: number;
    let email: string;
    let password = 'Password123!';
    let testFoodId = Number;

    beforeAll(async() => {
        const validPayload = {
            name: 'Minh Tran',
            email: `test_${Date.now()}@example.com`,
            password: 'Password123!',
            weight: 75,
            height: 175,
            gender: 'MALE',
            age: 22,
            workoutIntensity: 1.5
        };

        const res = await request(app)
            .post('/user/register')
            .send(validPayload)

        email = res.body.log.email;

        const authRes = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password
            });

        token = authRes.body.token;
        userId = authRes.body.user.id;
        const foodRes = await request(app)
            .post('/food/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
              name: 'Chicken Breast',
              protein: 31,
              carb: 0,
              fat: 3.6,
              fiber: 0,
              quantity: 100,
      });

        testFoodId = foodRes.body.id;
    });

    it('should return 200 and the requested food item', async () => {
      const res = await request(app).get(`/food/${testFoodId}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', testFoodId);
      expect(res.body).toHaveProperty('name');
    });

    it('should return 400 for invalid id param', async () => {
      const res = await request(app).get('/food/not-a-number');

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 404 when food does not exist', async () => {
      const res = await request(app).get('/food/999999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error');
    });

    it('should return 500 when database fails', async () => {
      vi.spyOn(prisma.food, 'findFirst').mockRejectedValueOnce(
        new Error('Database query failure')
      );

      const res = await request(app).get(`/food/${testFoodId}`);

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty('error');
    });
  });