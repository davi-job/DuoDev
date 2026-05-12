import { http } from './client';

interface LoginResponse {
    access_token: string;
    user: { id: string; name: string; email: string };
}

export function login(email: string, password: string) {
    return http.post<LoginResponse>('/auth/login', { email, password });
}
