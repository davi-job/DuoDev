import { http } from './client';

export interface PerfilUsuario {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export function buscarPerfil() {
    return http.get<PerfilUsuario>('/users/me');
}

export function atualizarPerfil(dados: { name?: string; email?: string }) {
    return http.patch<PerfilUsuario>('/users/me', dados);
}

export function atualizarSenha(senhaAtual: string, novaSenha: string) {
    return http.patch<void>('/users/me/senha', { senhaAtual, novaSenha });
}
