export type StatusCategoria = 'publicado' | 'rascunho' | 'revisao' | 'arquivado';

export interface Categoria {
    id: string;
    nome: string;
    descricao: string;
    status: StatusCategoria;
    icone: string; // nome do ícone do lucide-react
    corDestaque: string; // cor hexadecimal de destaque
    totalTrilhas: number;
    totalAulas: number;
    totalQuestoes: number;
    criadoEm: string;
    atualizadoEm: string;
}

export const STATUS_CONFIG: Record<
    StatusCategoria,
    { label: string; cor: 'verde' | 'amarelo' | 'vermelho' | 'azul' }
> = {
    publicado: { label: 'Publicado', cor: 'verde' },
    rascunho: { label: 'Rascunho', cor: 'amarelo' },
    revisao: { label: 'Revisão', cor: 'vermelho' },
    arquivado: { label: 'Arquivado', cor: 'azul' },
};
