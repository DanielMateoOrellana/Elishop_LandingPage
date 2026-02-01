import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private authService: AuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default-secret',
        });
    }

    async validate(payload: JwtPayload) {
        console.log('JWT Validate Payload:', payload);
        try {
            const user = await this.authService.validateUser(payload.sub);
            if (!user) {
                console.log('User not found in DB for sub:', payload.sub);
                throw new UnauthorizedException();
            }
            return user;
        } catch (error) {
            console.error('Error in JWT Strategy Validate:', error);
            throw error;
        }
    }
}
