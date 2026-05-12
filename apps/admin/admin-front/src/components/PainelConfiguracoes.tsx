import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PainelLateral from './PainelLateral';
import CampoFormulario from './CampoFormulario';
import { buscarPerfil, atualizarPerfil, atualizarSenha } from '../api/usuarios';
import { useAuth } from '../auth/AuthContext';
import { useToast } from './Toast';
import './PainelConfiguracoes.css';

interface PainelConfiguracoesProps {
    aberto: boolean;
    onFechar: () => void;
}

function PainelConfiguracoes({ aberto, onFechar }: PainelConfiguracoesProps) {
    const { updateUser } = useAuth();
    const { mostrarToast } = useToast();
    const queryClient = useQueryClient();

    const { data: perfil } = useQuery({
        queryKey: ['users', 'me'],
        queryFn: buscarPerfil,
        enabled: aberto,
    });

    // ─── Perfil ───
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        if (aberto && perfil) {
            setNome(perfil.name);
            setEmail(perfil.email);
        }
        if (!aberto) {
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
        }
    }, [perfil, aberto]);

    const perfilMutation = useMutation({
        mutationFn: () => atualizarPerfil({ name: nome, email }),
        onSuccess: (updated) => {
            updateUser({ name: updated.name, email: updated.email });
            queryClient.setQueryData(['users', 'me'], updated);
            mostrarToast('sucesso', 'Perfil atualizado com sucesso.');
        },
        onError: (err: Error) => {
            mostrarToast('erro', err.message || 'Erro ao atualizar perfil.');
        },
    });

    // ─── Senha ───
    const [senhaAtual, setSenhaAtual] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');

    const senhaMutation = useMutation({
        mutationFn: () => atualizarSenha(senhaAtual, novaSenha),
        onSuccess: () => {
            setSenhaAtual('');
            setNovaSenha('');
            setConfirmarSenha('');
            mostrarToast('sucesso', 'Senha alterada com sucesso.');
        },
        onError: (err: Error) => {
            let parsed: { statusCode?: number } = {};
            try { parsed = JSON.parse(err.message); } catch { /* not JSON */ }
            const msg = parsed.statusCode === 401
                ? 'Senha atual incorreta.'
                : 'Erro ao alterar senha.';
            mostrarToast('erro', msg);
        },
    });

    function handleSalvarPerfil(e: React.FormEvent) {
        e.preventDefault();
        perfilMutation.mutate();
    }

    function handleAlterarSenha(e: React.FormEvent) {
        e.preventDefault();
        if (novaSenha !== confirmarSenha) {
            mostrarToast('erro', 'A nova senha e a confirmação não coincidem.');
            return;
        }
        senhaMutation.mutate();
    }

    return (
        <PainelLateral aberto={aberto} onFechar={onFechar} titulo="Configurações" subtitulo="Conta">
            <div className="config-secoes">
                {/* ─── Perfil ─── */}
                <section className="config-secao">
                    <h3 className="config-secao-titulo">Perfil</h3>
                    <form className="config-form" onSubmit={handleSalvarPerfil}>
                        <CampoFormulario label="Nome de exibição">
                            <input
                                type="text"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                placeholder="Seu nome"
                                minLength={2}
                                required
                            />
                        </CampoFormulario>

                        <CampoFormulario label="E-mail">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                required
                            />
                        </CampoFormulario>

                        <button
                            type="submit"
                            className="config-btn"
                            disabled={perfilMutation.isPending}
                        >
                            {perfilMutation.isPending ? 'Salvando…' : 'Salvar perfil'}
                        </button>
                    </form>
                </section>

                <div className="config-divisor" />

                {/* ─── Segurança ─── */}
                <section className="config-secao">
                    <h3 className="config-secao-titulo">Segurança</h3>
                    <form className="config-form" onSubmit={handleAlterarSenha}>
                        <CampoFormulario label="Senha atual">
                            <input
                                type="password"
                                value={senhaAtual}
                                onChange={(e) => setSenhaAtual(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </CampoFormulario>

                        <CampoFormulario label="Nova senha">
                            <input
                                type="password"
                                value={novaSenha}
                                onChange={(e) => setNovaSenha(e.target.value)}
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                                required
                            />
                        </CampoFormulario>

                        <CampoFormulario label="Confirmar nova senha">
                            <input
                                type="password"
                                value={confirmarSenha}
                                onChange={(e) => setConfirmarSenha(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </CampoFormulario>

                        <button
                            type="submit"
                            className="config-btn"
                            disabled={senhaMutation.isPending}
                        >
                            {senhaMutation.isPending ? 'Alterando…' : 'Alterar senha'}
                        </button>
                    </form>
                </section>
            </div>
        </PainelLateral>
    );
}

export default PainelConfiguracoes;
