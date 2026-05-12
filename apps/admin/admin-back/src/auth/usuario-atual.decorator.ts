import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export class UsuarioJwt {
    id!: string;
    email!: string;
    role!: string;
}

export const UsuarioAtual = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): UsuarioJwt => {
        const request = ctx.switchToHttp().getRequest();
        return request.user as UsuarioJwt;
    },
);
