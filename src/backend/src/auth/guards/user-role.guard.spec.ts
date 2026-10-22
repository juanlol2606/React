import {
  BadRequestException,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { UserRoleGuard } from './user-role.guard';

const buildContext = (user: unknown): ExecutionContext =>
  ({
    getHandler: () => () => undefined,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as unknown as ExecutionContext;

describe('UserRoleGuard (autorización por roles)', () => {
  const reflector = { get: jest.fn() };
  let guard: UserRoleGuard;

  beforeEach(() => {
    jest.resetAllMocks();
    guard = new UserRoleGuard(reflector as unknown as Reflector);
  });

  it('permite el acceso si la ruta no declara roles', () => {
    reflector.get.mockReturnValue(undefined);
    expect(guard.canActivate(buildContext({ roles: ['user'] }))).toBe(true);
  });

  it('permite el acceso si la lista de roles está vacía (@Auth())', () => {
    reflector.get.mockReturnValue([]);
    expect(guard.canActivate(buildContext({ roles: ['user'] }))).toBe(true);
  });

  it('permite el acceso si el usuario tiene alguno de los roles requeridos', () => {
    reflector.get.mockReturnValue(['admin', 'super-user']);
    expect(
      guard.canActivate(buildContext({ roles: ['user', 'super-user'] })),
    ).toBe(true);
  });

  it('responde 403 si el usuario no tiene ningún rol requerido', () => {
    reflector.get.mockReturnValue(['admin']);
    expect(() =>
      guard.canActivate(buildContext({ fullName: 'Ana', roles: ['user'] })),
    ).toThrow(ForbiddenException);
  });

  it('responde 400 si la petición no trae usuario (guard de autenticación omitido)', () => {
    reflector.get.mockReturnValue(['admin']);
    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      BadRequestException,
    );
  });
});
