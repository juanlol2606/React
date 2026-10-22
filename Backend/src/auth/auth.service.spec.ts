import {
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { User } from './entities/user.entity';

const PLAIN_PASSWORD = 'Abc123';

/** Entidad tal como la devolvería TypeORM; incluye el hash a propósito. */
const buildUser = (overrides: Partial<User> = {}): User =>
  ({
    id: '60eb7791-1d26-4ad8-b5a0-ac741c92475a',
    email: 'test1@google.com',
    fullName: 'Test One',
    password: bcrypt.hashSync(PLAIN_PASSWORD, 4),
    isActive: true,
    roles: ['user'],
    ...overrides,
  }) as User;

describe('AuthService', () => {
  let service: AuthService;
  const userRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
  const jwtService = { sign: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    jwtService.sign.mockReturnValue('signed.jwt.token');

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = moduleRef.get(AuthService);
  });

  describe('create (registro)', () => {
    const dto = {
      email: 'Test1@Google.com',
      fullName: 'Test One',
      password: PLAIN_PASSWORD,
    };

    it('guarda la contraseña cifrada con bcrypt, nunca en texto plano', async () => {
      userRepository.create.mockImplementation((data: Partial<User>) => data);
      userRepository.save.mockResolvedValue(undefined);

      await service.create(dto);

      const [persisted] = userRepository.create.mock.calls[0] as [User];
      expect(persisted.password).not.toBe(PLAIN_PASSWORD);
      expect(bcrypt.compareSync(PLAIN_PASSWORD, persisted.password!)).toBe(
        true,
      );
    });

    it('devuelve el usuario público y un JWT firmado con el id', async () => {
      const entity = buildUser();
      userRepository.create.mockReturnValue(entity);
      userRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(jwtService.sign).toHaveBeenCalledWith({ id: entity.id });
      expect(result.token).toBe('signed.jwt.token');
      expect(result.user).toEqual({
        id: entity.id,
        email: entity.email,
        fullName: entity.fullName,
        isActive: true,
        roles: ['user'],
      });
    });

    it('ADR-001: la respuesta NO contiene password aunque la entidad aún tenga el hash', async () => {
      // La entidad conserva el hash: equivale a "olvidar" un delete manual.
      const entity = buildUser();
      userRepository.create.mockReturnValue(entity);
      userRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);
      const serialized = JSON.stringify(result);

      expect(entity.password).toBeDefined();
      expect(result.user).not.toHaveProperty('password');
      expect(serialized).not.toContain('password');
      expect(serialized).not.toContain(entity.password!);
    });

    it('ADR-001: una propiedad sensible nueva en la entidad no se expone por defecto', async () => {
      const entity = buildUser();
      Object.assign(entity, { resetToken: 'secreto-futuro' });
      userRepository.create.mockReturnValue(entity);
      userRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(JSON.stringify(result)).not.toContain('secreto-futuro');
    });

    it('ADR-001: también excluye password cuando la entidad es una instancia real de User', async () => {
      // TypeORM entrega instancias de la clase User, no objetos planos.
      const entity = Object.assign(new User(), buildUser());
      userRepository.create.mockReturnValue(entity);
      userRepository.save.mockResolvedValue(entity);

      const result = await service.create(dto);

      expect(entity).toBeInstanceOf(User);
      expect(JSON.stringify(result)).not.toContain(entity.password!);
      expect(Object.keys(result.user).sort()).toEqual([
        'email',
        'fullName',
        'id',
        'isActive',
        'roles',
      ]);
    });

    it('responde 400 si el correo ya existe (código 23505 de PostgreSQL)', async () => {
      userRepository.create.mockReturnValue(buildUser());
      userRepository.save.mockRejectedValue({
        code: '23505',
        detail: 'Key (email) already exists.',
      });

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('responde 500 ante un error inesperado de base de datos', async () => {
      const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      userRepository.create.mockReturnValue(buildUser());
      userRepository.save.mockRejectedValue(new Error('db caída'));

      await expect(service.create(dto)).rejects.toBeInstanceOf(
        InternalServerErrorException,
      );
      logSpy.mockRestore();
    });
  });

  describe('login (inicio de sesión)', () => {
    it('con credenciales válidas devuelve usuario público y JWT', async () => {
      const entity = buildUser();
      userRepository.findOne.mockResolvedValue(entity);

      const result = await service.login({
        email: entity.email,
        password: PLAIN_PASSWORD,
      });

      expect(result.token).toBe('signed.jwt.token');
      expect(result.user.email).toBe(entity.email);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: entity.id });
    });

    it('ADR-001: la respuesta de login nunca incluye password ni su hash', async () => {
      const entity = buildUser();
      userRepository.findOne.mockResolvedValue(entity);

      const result = await service.login({
        email: entity.email,
        password: PLAIN_PASSWORD,
      });
      const serialized = JSON.stringify(result);

      expect(result.user).not.toHaveProperty('password');
      expect(serialized).not.toContain(entity.password!);
    });

    it('con correo inexistente responde 401 y no firma ningún token', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nadie@google.com', password: PLAIN_PASSWORD }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('con contraseña incorrecta responde 401 y no firma ningún token', async () => {
      userRepository.findOne.mockResolvedValue(buildUser());

      await expect(
        service.login({ email: 'test1@google.com', password: 'Incorrecta1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });
  });

  describe('checkAuthStatus (renovación del token)', () => {
    it('re-emite un JWT y devuelve el usuario público', () => {
      const entity = buildUser({ roles: ['admin'] });

      const result = service.checkAuthStatus(entity);

      expect(jwtService.sign).toHaveBeenCalledWith({ id: entity.id });
      expect(result.token).toBe('signed.jwt.token');
      expect(result.user.roles).toEqual(['admin']);
      expect(JSON.stringify(result)).not.toContain(entity.password!);
    });
  });
});
