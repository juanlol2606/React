/**
 * Pruebas de integración HTTP del módulo Auth (ADR-004).
 *
 * Levanta una aplicación Nest real con AuthController, AuthService, JwtStrategy
 * (Passport), JwtModule y los guards (AuthGuard + UserRoleGuard) usando
 * supertest. Solo el repositorio de TypeORM está simulado, por lo que NO se
 * requiere PostgreSQL y las pruebas corren con `npm test`.
 */
import {
  Controller,
  Get,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { App } from 'supertest/types';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth, GetUser } from './decorators';
import { User } from './entities/user.entity';
import { ValidRoles } from './interfaces';
import { JwtStrategy } from './strategies/jwt.strategy';

interface AuthBody {
  token: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    isActive: boolean;
    roles: string[];
  };
}

const JWT_SECRET = 'secreto-de-pruebas-de-integracion';
const PLAIN_PASSWORD = 'Abc123';

/** Controlador de sondeo SOLO para pruebas: reemplaza a las antiguas rutas private*. */
@Controller('probe')
class ProbeController {
  @Get('any')
  @Auth()
  any(@GetUser() user: User) {
    return { ok: true, id: user.id };
  }

  @Get('admin')
  @Auth(ValidRoles.admin)
  admin(@GetUser() user: User) {
    return { ok: true, id: user.id };
  }

  @Get('staff')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  staff(@GetUser() user: User) {
    return { ok: true, id: user.id };
  }
}

describe('Auth (integración HTTP: Guards + Passport + JWT)', () => {
  let app: INestApplication<App>;
  let jwtService: JwtService;
  let hash: string;
  let users: Map<string, User>;

  const userRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
  };

  const makeUser = (id: string, overrides: Partial<User> = {}): User =>
    ({
      id,
      email: `${id}@google.com`,
      fullName: `Usuario ${id}`,
      password: hash,
      isActive: true,
      roles: ['user'],
      ...overrides,
    }) as User;

  const authBody = (res: request.Response) => res.body as AuthBody;
  const tokenFor = (id: string) => jwtService.sign({ id });
  const bearer = (token: string) => `Bearer ${token}`;

  beforeAll(async () => {
    hash = bcrypt.hashSync(PLAIN_PASSWORD, 4);

    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET })],
        }),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
          imports: [ConfigModule],
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '2h' },
          }),
        }),
      ],
      controllers: [AuthController, ProbeController],
      providers: [
        AuthService,
        JwtStrategy,
        { provide: getRepositoryToken(User), useValue: userRepository },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }),
    );
    await app.init();

    jwtService = moduleRef.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();

    users = new Map<string, User>([
      ['usuario', makeUser('usuario')],
      ['admin', makeUser('admin', { roles: ['admin'] })],
      ['staff', makeUser('staff', { roles: ['super-user'] })],
      ['inactivo', makeUser('inactivo', { isActive: false })],
    ]);

    userRepository.findOneBy.mockImplementation(({ id }: { id: string }) =>
      Promise.resolve(users.get(id) ?? null),
    );
    userRepository.findOne.mockImplementation(
      ({ where }: { where: { email: string } }) =>
        Promise.resolve(
          [...users.values()].find((u) => u.email === where.email) ?? null,
        ),
    );
    userRepository.create.mockImplementation((data: Partial<User>) => ({
      ...data,
    }));
    // Como TypeORM, `save` muta la entidad recibida con los valores que genera
    // PostgreSQL (id, isActive y roles por defecto).
    userRepository.save.mockImplementation((u: Partial<User>) => {
      Object.assign(u, { id: 'nuevo', isActive: true, roles: ['user'] });
      return Promise.resolve(u);
    });
  });

  describe('POST /api/auth/register', () => {
    const body = {
      email: 'nuevo@google.com',
      fullName: 'Usuario Nuevo',
      password: PLAIN_PASSWORD,
    };

    it('201: registra al usuario y devuelve usuario público + JWT, sin password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(body)
        .expect(201);

      const payload = jwtService.verify<{ id: string }>(authBody(res).token);
      expect(payload.id).toBe('nuevo');
      expect(authBody(res).user).toEqual({
        id: 'nuevo',
        email: body.email,
        fullName: body.fullName,
        isActive: true,
        roles: ['user'],
      });
      expect(JSON.stringify(res.body)).not.toMatch(/password/i);
      expect(JSON.stringify(res.body)).not.toContain('$2b$');
    });

    it('400: rechaza una contraseña débil', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...body, password: 'abcdef' })
        .expect(400);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('400: rechaza un correo inválido', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...body, email: 'no-es-correo' })
        .expect(400);
    });

    it('400: rechaza propiedades no permitidas (no se puede auto-asignar el rol admin)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...body, roles: ['admin'] })
        .expect(400);
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('400: correo ya registrado', async () => {
      userRepository.save.mockRejectedValue({
        code: '23505',
        detail: 'Key (email)=(nuevo@google.com) already exists.',
      });

      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(body)
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('201: credenciales válidas devuelven JWT verificable y usuario sin password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'usuario@google.com', password: PLAIN_PASSWORD })
        .expect(201);

      expect(jwtService.verify<{ id: string }>(authBody(res).token).id).toBe(
        'usuario',
      );
      expect(authBody(res).user.email).toBe('usuario@google.com');
      expect(JSON.stringify(res.body)).not.toMatch(/password/i);
      expect(JSON.stringify(res.body)).not.toContain(hash);
    });

    it('401: contraseña incorrecta', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'usuario@google.com', password: 'Incorrecta1' })
        .expect(401);
      expect(authBody(res).token).toBeUndefined();
    });

    it('401: correo inexistente', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'nadie@google.com', password: PLAIN_PASSWORD })
        .expect(401);
    });

    it('400: cuerpo mal formado (correo inválido)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'x', password: PLAIN_PASSWORD })
        .expect(400);
    });
  });

  describe('GET /api/auth/check-status (ruta protegida + renovación)', () => {
    it('401: sin cabecera Authorization', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/check-status')
        .expect(401);
    });

    it('401: token mal formado', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/check-status')
        .set('Authorization', bearer('esto.no.es-un-jwt'))
        .expect(401);
    });

    it('401: token firmado con otro secreto', async () => {
      const forged = new JwtService({ secret: 'otro-secreto' }).sign({
        id: 'admin',
      });

      await request(app.getHttpServer())
        .get('/api/auth/check-status')
        .set('Authorization', bearer(forged))
        .expect(401);
    });

    it('401: token expirado', async () => {
      const expired = jwtService.sign({ id: 'usuario' }, { expiresIn: '-10s' });

      await request(app.getHttpServer())
        .get('/api/auth/check-status')
        .set('Authorization', bearer(expired))
        .expect(401);
    });

    it('401: el usuario del token ya no existe', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/check-status')
        .set('Authorization', bearer(tokenFor('borrado')))
        .expect(401);
    });

    it('401: el usuario del token está inactivo', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/check-status')
        .set('Authorization', bearer(tokenFor('inactivo')))
        .expect(401);
    });

    it('200: token válido devuelve usuario público y un JWT renovado', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/auth/check-status')
        .set('Authorization', bearer(tokenFor('usuario')))
        .expect(200);

      expect(authBody(res).user.id).toBe('usuario');
      expect(jwtService.verify<{ id: string }>(authBody(res).token).id).toBe(
        'usuario',
      );
      expect(JSON.stringify(res.body)).not.toMatch(/password/i);
    });
  });

  describe('Autorización por roles (AuthGuard + UserRoleGuard)', () => {
    const get = (path: string, token?: string) => {
      const req = request(app.getHttpServer()).get(path);
      return token ? req.set('Authorization', bearer(token)) : req;
    };

    it('401: una ruta con rol exige autenticación antes que autorización', async () => {
      await get('/api/probe/admin').expect(401);
    });

    it('200: @Auth() sin roles admite a cualquier usuario autenticado', async () => {
      await get('/api/probe/any', tokenFor('usuario')).expect(200);
    });

    it('403: un usuario con rol "user" no accede a una ruta de admin', async () => {
      await get('/api/probe/admin', tokenFor('usuario')).expect(403);
    });

    it('200: un admin accede a la ruta de admin', async () => {
      await get('/api/probe/admin', tokenFor('admin')).expect(200);
    });

    it('403: un super-user no accede a una ruta exclusiva de admin', async () => {
      await get('/api/probe/admin', tokenFor('staff')).expect(403);
    });

    it('200: admin y super-user acceden a la ruta compartida; user no', async () => {
      await get('/api/probe/staff', tokenFor('admin')).expect(200);
      await get('/api/probe/staff', tokenFor('staff')).expect(200);
      await get('/api/probe/staff', tokenFor('usuario')).expect(403);
    });
  });

  describe('Rutas de prueba retiradas (ADR-003)', () => {
    it.each(['private', 'private2', 'private3'])(
      'GET /api/auth/%s ya no existe (404), ni siquiera con un token de admin',
      async (route) => {
        await request(app.getHttpServer())
          .get(`/api/auth/${route}`)
          .set('Authorization', bearer(tokenFor('admin')))
          .expect(404);
      },
    );
  });
});
