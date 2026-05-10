import { useState } from 'react';

import CampoFormulario from './CampoFormulario';
import StatusPill from './StatusPill';

import type { Trilha, CreateTrilhaDto, StatusTrilha } from '../types';
import { STATUS_CONFIG } from '../types';

import './FormularioTrilha.css';

const NIVEIS = ['iniciante', 'intermediário', 'avançado'] as const;

const CORES_DISPONIVEIS = [
    '#3CEFB0', '#F7DF1E', '#5B9BD5', '#C792EA', '#61DAFB',
    '#FF8A65', '#3178C6', '#FF6B9D', '#A3E635', '#FB923C',
];

interface FormularioTrilhaProps {
    trilha?: Trilha;
    categoryId: string;
    onSalvar: (dados: CreateTrilhaDto) => void;
    onCancelar: () => void;
}

function FormularioTrilha({ trilha, categoryId, onSalvar, onCancelar }: FormularioTrilhaProps) {
    const [name, setName] = useState(trilha?.name ?? '');
    const [level, setLevel] = useState(trilha?.level ?? 'iniciante');
    const [description, setDescription] = useState(trilha?.description ?? '');
    const [status, setStatus] = useState<StatusTrilha>(trilha?.status ?? 'rascunho');
    const [thumbColor, setThumbColor] = useState(trilha?.thumbColor ?? CORES_DISPONIVEIS[0]);
    const [duration, setDuration] = useState(trilha?.duration ?? '');
    const [totalHours, setTotalHours] = useState(trilha?.totalHours?.toString() ?? '');
    const [year, setYear] = useState(trilha?.year?.toString() ?? '');

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        onSalvar({
            categoryId,
            name,
            level,
            description,
            thumbColor,
            status,
            duration: duration || undefined,
            totalHours: totalHours ? Number(totalHours) : undefined,
            year: year ? Number(year) : undefined,
        });
    }

    return (
        <form className="form-trilha" onSubmit={handleSubmit}>
            <CampoFormulario label="Nome">
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: HTML e CSS do Zero"
                    required
                />
            </CampoFormulario>

            <CampoFormulario label="Nível">
                <div className="nivel-opcoes">
                    {NIVEIS.map((n) => (
                        <button
                            key={n}
                            type="button"
                            className={`nivel-opcao ${level === n ? 'selecionado' : ''}`}
                            onClick={() => setLevel(n)}
                        >
                            {n.charAt(0).toUpperCase() + n.slice(1)}
                        </button>
                    ))}
                </div>
            </CampoFormulario>

            <CampoFormulario label="Descrição">
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descreva o objetivo desta trilha..."
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
                            onClick={() => setStatus(valor as StatusTrilha)}
                        >
                            <StatusPill cor={cfg.cor} texto={cfg.label} />
                        </button>
                    ))}
                </div>
            </CampoFormulario>

            <CampoFormulario label="Cor de Destaque">
                <div className="cor-grade">
                    {CORES_DISPONIVEIS.map((cor) => (
                        <button
                            key={cor}
                            type="button"
                            className={`cor-opcao ${thumbColor === cor ? 'selecionado' : ''}`}
                            onClick={() => setThumbColor(cor)}
                            style={{ backgroundColor: cor }}
                        />
                    ))}
                </div>
            </CampoFormulario>

            <div className="form-trilha-extras">
                <CampoFormulario label="Duração">
                    <input
                        type="text"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        placeholder="Ex: 8 semanas"
                    />
                </CampoFormulario>

                <CampoFormulario label="Total de Horas">
                    <input
                        type="number"
                        value={totalHours}
                        onChange={(e) => setTotalHours(e.target.value)}
                        placeholder="Ex: 40"
                        min="0"
                    />
                </CampoFormulario>

                <CampoFormulario label="Ano">
                    <input
                        type="number"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder={String(new Date().getFullYear())}
                    />
                </CampoFormulario>
            </div>

            <div className="form-acoes">
                <button type="button" className="btn-cancelar" onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                    {trilha ? 'Salvar Alterações' : 'Criar Trilha'}
                </button>
            </div>
        </form>
    );
}

export default FormularioTrilha;
