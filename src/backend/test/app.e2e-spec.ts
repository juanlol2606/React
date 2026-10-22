import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

/**
 * PENDIENTE (ver docs/adr/ADR-004): este test es la plantilla que genera NestJS
 * y no aplica tal cual a este proyecto:
 *  1. AppModule conecta a PostgreSQL (TypeOrmModule.forRoot), por lo que exige
 *     una base de datos levantada (docker compose up -d db).
 *  2. AppModule no define ningún controlador en "/", así que `GET /` no
 *     devuelve "Hello World!".
 * Se conserva el archivo y se omite hasta reemplazarlo por pruebas e2e reales
 * del módulo Auth contra una base de datos de pruebas (Semana 14-15).
 * Las pruebas del módulo Auth que sí corren hoy están en src/auth/*.spec.ts.
 */
describe.skip('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
