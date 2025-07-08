import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IUserService } from '../../../modules/users/interfaces/user-service.interface';
import { UserResponseDto } from '../../../modules/users/dto/user-response.dto';
import { USER_SERVICE } from '../../../modules/users/users.constants';

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @Inject(USER_SERVICE)
    private readonly userService: IUserService,
  ) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not defined in the configuration');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<UserResponseDto> {
    // The payload is already verified by JWT at this point
    const user = await this.userService.findOne(payload.sub);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }
}
