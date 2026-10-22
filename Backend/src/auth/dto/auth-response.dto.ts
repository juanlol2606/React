import { ApiProperty } from '@nestjs/swagger';

import { UserResponseDto } from './user-response.dto';

/**
 * Respuesta de los endpoints de autenticación (register, login, check-status).
 * Se mantiene `token` en el cuerpo para no romper al Frontend actual; con la
 * ADR-002 el JWT pasará a viajar en una cookie httpOnly y este campo se retira.
 */
export class AuthResponseDto {
  @ApiProperty({ type: () => UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({
    description: 'JSON Web Token (JWT) que identifica al usuario',
  })
  token: string;
}
