import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import {
  AuthResponseDto,
  CreateUserDto,
  LoginUserDto,
  UserResponseDto,
} from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
    try {
      const { password, ...userData } = createUserDto;

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      return this.buildAuthResponse(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<AuthResponseDto> {
    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        fullName: true,
        isActive: true,
        roles: true,
      },
    });

    if (!user)
      throw new UnauthorizedException('Credentials are not valid (email)');

    if (!bcrypt.compareSync(password, user.password!))
      throw new UnauthorizedException('Credentials are not valid (password)');

    return this.buildAuthResponse(user);
  }

  checkAuthStatus(user: User): AuthResponseDto {
    return this.buildAuthResponse(user);
  }

  /**
   * Único punto donde se arma la respuesta de autenticación (ADR-001).
   * La exclusión de campos sensibles (p. ej. `password`) es declarativa: la
   * define UserResponseDto mediante @Expose(), no una línea `delete` en cada
   * método.
   */
  private buildAuthResponse(user: User): AuthResponseDto {
    return {
      user: UserResponseDto.fromEntity(user),
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  private handleDBErrors(error: any): never {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException('Check server logs');
  }
}
