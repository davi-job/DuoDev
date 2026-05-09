import { useState } from 'react';
import * as icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import CampoFormulario from './CampoFormulario';
import StatusPill from './StatusPill';

import type { Categoria, StatusCategoria } from '../types';
import { STATUS_CONFIG } from '../types';

import './FormularioCategoria.css';

const ICONES_DISPONIVEIS = [
    'Globe', 'BrainCircuit', 'FileCode2', 'Layout', 'Server',
    'Smartphone', 'Database', 'ShieldCheck', 'Code', 'Terminal',
    'Cpu', 'GitBranch', 'Cloud', 'Palette', 'Gamepad2',
] as const;

const CORES_DISPONIVEIS = [
    '#3CEFB0', '#F7DF1E', '#5B9BD5', '#C792EA', '#61DAFB',
    '#FF8A65', '#3178C6', '#FF6B9D', '#A3E635', '#FB923C',
];

interface FormularioCategoriaProps {
    categoria?: Categoria;
    onSalvar: (dados: Omit<Categoria, 'id' | 'criadoEm' | 'atualizadoEm' | 'totalTrilhas' | 'totalAulas' | 'totalQuestoes'>) => void;
    onCancelar: () => void;
}

function FormularioCategoria({ categoria, onSalvar, onCancelar }: FormularioCategoriaProps) {
    const [nome, setNome] = useState(categoria?.nome ?? '');
    const [descricao, setDescricao] = useState(categoria?.descricao ?? '');
    const [status, setStatus] = useState<StatusCategoria>(categoria?.status ?? 'rascunho');
    const [icone, setIcone] = useState(categoria?.icone ?? 'Code');
    const [corDestaque, setCorDestaque] = useState(categoria?.corDestaque ?? CORES_DISPONIVEIS[0]);

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSalvar({ nome, descricao, status, icone, corDestaque });
    }

    return (
        <form className="form-categoria" onSubmit={handleSubmit}>
            <CampoFormulario label="Nome">
                <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Fundamentos da Web"
                    required
                />
            </CampoFormulario>

            <CampoFormulario label="Descrição">
                <textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva o objetivo desta categoria..."
                    required
                />
            </CampoFormulario>

            <CampoFormulario label="Status">
                <div className="status-opcoes">
                    {Object.entries(STATUS_CONFIG).map(([valor, cfg]) => (
                        <button
                            key={valor}
                            type="button"
                            className={`status-opcao ${status === valor ? 'selecionado' : ''}`}
                            onClick={() => setStatus(valor as StatusCategoria)}
                        >
                            <StatusPill cor={cfg.cor} texto={cfg.label} />
                        </button>
                    ))}
                </div>
            </CampoFormulario>

            <CampoFormulario label="Ícone">
                <div className="icone-grade">
                    {ICONES_DISPONIVEIS.map((nomeIcone) => {
                        const IconeComponente = icons[nomeIcone] as LucideIcon;
                        return (
                            <button
                                key={nomeIcone}
                                type="button"
                                className={`icone-opcao ${icone === nomeIcone ? 'selecionado' : ''}`}
                                onClick={() => setIcone(nomeIcone)}
                                title={nomeIcone}
                                style={
                                    icone === nomeIcone
                                        ? { borderColor: corDestaque, backgroundColor: `${corDestaque}15` }
                                        : undefined
                                }
                            >
                                <IconeComponente size={20} color={icone === nomeIcone ? corDestaque : undefined} />
                            </button>
                        );
                    })}
                </div>
            </CampoFormulario>

            <CampoFormulario label="Cor de Destaque">
                <div className="cor-grade">
                    {CORES_DISPONIVEIS.map((cor) => (
                        <button
                            key={cor}
                            type="button"
                            className={`cor-opcao ${corDestaque === cor ? 'selecionado' : ''}`}
                            onClick={() => setCorDestaque(cor)}
                            style={{ backgroundColor: cor }}
                        />
                    ))}
                </div>
            </CampoFormulario>

            {/* Prévia */}
            <CampoFormulario label="Prévia">
                <div className="previa-categoria">
                    <div
                        className="previa-icone"
                        style={{ backgroundColor: `${corDestaque}20`, color: corDestaque }}
                    >
                        {(() => {
                            const Icone = icons[icone as keyof typeof icons] as LucideIcon;
                            return <Icone size={24} />;
                        })()}
                    </div>
                    <div className="previa-info">
                        <span className="previa-nome">{nome || 'Nome da Categoria'}</span>
                        <span className="previa-descricao">{descricao || 'Descrição da categoria...'}</span>
                    </div>
                </div>
            </CampoFormulario>

            <div className="form-acoes">
                <button type="button" className="btn-cancelar" onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                    {categoria ? 'Salvar Alterações' : 'Criar Categoria'}
                </button>
            </div>
        </form>
    );
}

export default FormularioCategoria;
