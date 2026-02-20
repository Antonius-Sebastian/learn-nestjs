import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

interface AuthResponse {
  id: number;
  email: string;
}

describe('Auth (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app?.close();
  });

  it('should handle a signup request', async () => {
    const testEmail = 'e2e@test.com';

    return request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: testEmail, password: 'e2eTest' })
      .expect(201)
      .then((res) => {
        const { id, email } = res.body as AuthResponse;
        expect(id).toBeDefined();
        expect(email).toEqual(testEmail);
      });
  });

  it('should sign up as a new user then get the currently logged in user', async () => {
    const testEmail = 'e2e@test.com';

    const res = await request(app.getHttpServer())
      .post('/auth/signUp')
      .send({ email: testEmail, password: 'e2eTest' })
      .expect(201);

    const cookie = res.get('Set-Cookie') ?? [];

    const meRes = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Cookie', cookie)
      .expect(200);

    const body = meRes.body as AuthResponse;
    expect(body.email).toEqual(testEmail);
  });
});
