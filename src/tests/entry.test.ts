import { describe, it, expect, beforeAll, vi } from 'vitest';
import request from 'supertest';
import { app } from "../index";
import prisma from '../lib/prisma';

describe('testing POST /entry/create', () => {
    let token: string;
    let userId: number;

    beforeAll(async() => {
        const authRes = await request(app)
            .post('/user/login')
            .send({
                email: 'roberttran1207@gmail.com',
                password: 'MinhTran1212'
            });

        token = authRes.body.token;
        userId = authRes.body.user.id;
    });

    it('POST/ should return json and 200', async () => {
        const res = await request(app)
            .post('/entry/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                foodId: 14,
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

    it('POST/ should return 401', async () => {
        const res = await request(app)
            .post('/entry/create')
            .send({
                foodId: 14,
                quantity: 3
            })
        expect(res.status).toBe(401);
    });

    it('POST/ should return 400', async () => {
        const res = await request(app)
            .post('/entry/create')
            .set('Authorization', `Bearer ${token}`)
            .send({
                foodId: "abc",
                quantity: 3
            })
        expect(res.status).toBe(400);
    });

    it('POST/ should return 500 and error body', async () => {
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