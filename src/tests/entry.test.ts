import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from "../index";
import prisma from '../lib/prisma';
import test from 'node:test';

describe('testing POST /entry/create', () => {
    let token: string;
    let userId: number;
    let email: string;
    let password = 'Password123!';
    let testFoodId: number;

    beforeAll(async() => {
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
            .post('/entry/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                foodId: testFoodId,
                quantity: 3
            })
        
        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            entry: {
                id: expect.any(Number),
                userId: userId,
                foodId: expect.any(Number),
                quantity: expect.any(Number),
                createdAt: expect.any(String),
            }
        });
    });

    it('should return 401', async () => {
        const res = await request(app)
            .post('/entry/create')
            .send({
                foodId: 14,
                quantity: 3
            })
        expect(res.status).toBe(401);
    });

    it('should return 400', async () => {
        const res = await request(app)
            .post('/entry/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                foodId: "abc",
                quantity: 3
            })
        expect(res.status).toBe(400);
    });

    it('should return 500 and error body', async () => {
        vi.spyOn(prisma.entry, 'create').mockRejectedValueOnce(
            new Error('Database connection failed')
        );

        const res = await request(app)
            .post('/entry/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                foodId: 14,
                quantity: 3
            })

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('testing GET /entry/getnutrition/:id', () => {
    let token: string;
    let userId: number;
    let entryId: number;
    let email: string;
    let password = 'Password123!';
    let testFoodId: number;


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

        const authRes = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password
            })


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

        const entryRes = await request(app)
        .post('/entry/create')
        .set('Authorization', `Bearer ${token}`)
        .send({
          foodId: testFoodId,
          quantity: 2,
        });
        entryId = entryRes.body.entry.id;


        
    });

    it('should return 200 and json', async () => {
        const res = await request(app)
            .get(`/entry/getnutrition/${entryId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            id: expect.any(Number),
            name: expect.any(String),
            totalGrams: expect.any(Number),
            protein: expect.any(Number),
            carb: expect.any(Number),
            fat: expect.any(Number),
            fiber: expect.any(Number),
            calories: expect.any(Number)
        });
    });

    it('should return 401', async () => {
        const res = await request(app)
            .get(`/entry/getnutrition/${entryId}`)
        expect(res.status).toBe(401);
    });

    it('should return 404', async () => {
        const res = await request(app)
            .get(`/entry/getnutrition/9999`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(404);
    });


    it('should return 500 and error body', async () => {
        vi.spyOn(prisma.entry, 'findFirst').mockRejectedValueOnce(
            new Error('Database connection failed')
        );

        const res = await request(app)
            .get(`/entry/getnutrition/${entryId}`)
            .set('Authorization', `Bearer ${token}`)

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('testing PATCH /entry/update/:id', () => {
    let userId: number;
    let token: string;
    let entryId: number;
    let email: string;
    let password = 'Password123!';
    let testFoodId: number;

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
        
        email = res.body.log.email;
        const authRes = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password
            })
        
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

        const entryRes = await request(app)
            .post('/entry/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                foodId: testFoodId, 
                quantity: 2
            })
        entryId = entryRes.body.entry.id;
    });

    it('should return 200', async() => {
        const update = await request(app)
            .patch(`/entry/update/${entryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity: 4
            })

        expect(update.status).toBe(200);
        expect(update.body).toMatchObject({
            message: expect.any(String)
        });
    });

    it('should return 401 for no token', async() => {
        const update = await request(app)
            .patch(`/entry/update/${entryId}`)
            .send({
                quantity: 4
            })

        expect(update.status).toBe(401);
    });

    it('should return 400 for bad input', async() => {
        const update = await request(app)
            .patch(`/entry/update/${entryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity: "abc"
            })

        expect(update.status).toBe(400);
    });

    it('should return 500 and error body', async () => {
        vi.spyOn(prisma.entry, 'update').mockRejectedValueOnce(
            new Error('Database connection failed')
        );

        const res = await request(app)
            .patch(`/entry/update/${entryId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({
                quantity: 4
            })

        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});

describe('testing DELETE /entry/:id', () => {
    let userId: number;
    let token: string;
    let entryId: number;
    let email: string;
    let password = 'Password123!';
    let testFoodId: number;

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
        
        email = res.body.log.email;
        const authRes = await request(app)
            .post('/user/login')
            .send({
                email: email,
                password: password
            })
        
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

        const entryRes = await request(app)
            .post('/entry/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                foodId: testFoodId, 
                quantity: 2
            })
        entryId = entryRes.body.entry.id;
    });

    it('should return 200 and json', async () => {
        const res = await request(app)
            .delete(`/entry/${entryId}`)
            .set('Authorization', `Bearer ${token}`)
            

        expect(res.status).toBe(200);
        expect(res.body).toMatchObject({
            message: expect.any(String),
            food: {
                id: expect.any(Number),
                userId: expect.any(Number),
                foodId: expect.any(Number),
                quantity: expect.any(Number),
            }
        });
    });

    it('should return 401', async () => {
        const res = await request(app)
            .delete(`/entry/${entryId}`)
        expect(res.status).toBe(401);
    });

    it('should return 400', async () => {
        const res = await request(app)
            .delete(`/entry/abc`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(400);
    });

    it('should return 404 for not found entry id', async () => {
        const res = await request(app)
            .delete(`/entry/10000000`)
            .set('Authorization', `Bearer ${token}`)
        expect(res.status).toBe(404);
    });
});