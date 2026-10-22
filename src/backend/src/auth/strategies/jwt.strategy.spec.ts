import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from '../entities/user.entity';
import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy (Passport)', () => {
  const userRepository = { findOneBy: jest.fn() };
  const configService = {
    get: jest.fn().mockReturnValue('secreto-de-pruebas'),
  } as unknown as ConfigService;

  let strategy: JwtStrategy;

  beforeEach(() => {
    jest.resetAllMocks();
    (configService.get as jest.Mock).mockReturnValue('secreto-de-pruebas');
    strategy = new JwtStrategy(userRepository as never, configService);
  });

  it('devuelve el usuario cuando el payload es válido y el usuario está activo', async () => {
    const user = { id: 'u-1', isActive: true, roles: ['user'] } as User;
    userRepository.findOneBy.mockResolvedValue(user);

    await expect(strategy.validate({ id: 'u-1' })).resolves.toBe(user);
    expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 'u-1' });
  });

  it('rechaza con 401 si el usuario del token ya no existe', async () => {
    userRepository.findOneBy.mockResolvedValue(null);

    await expect(strategy.validate({ id: 'fantasma' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('rechaza con 401 si el usuario está inactivo', async () => {
    userRepository.findOneBy.mockResolvedValue({
      id: 'u-2',
      isActive: false,
    });

    await expect(strategy.validate({ id: 'u-2' })).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
