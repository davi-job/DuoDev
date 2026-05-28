import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/(modules)/conteudo/$categoriaId')({
    component: Outlet,
});
