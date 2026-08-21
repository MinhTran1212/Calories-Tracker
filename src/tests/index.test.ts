import { describe, it, expect } from "vitest";
import  request from "supertest";
import { app } from "../index";

describe('Base application set up', () => {
    it('GET/ should return html index file', async () => {
        const res = await request(app).get('/');
        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/text\/html/);
    })

    it('should return 404 for unknown route', async () => {
        const res = await request(app).get('/this-route-does-not-exist');
        expect(res.status).toBe(404);
    })
});