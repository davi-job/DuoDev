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
    const [heroTagline, setHeroTagline] = useState(trilha?.metadata?.heroTagline ?? '');
    const [estimatedXp, setEstimatedXp] = useState(trilha?.metadata?.estimatedXp?.toString() ?? '');
    const [recommendedDays, setRecommendedDays] = useState(
        trilha?.metadata?.recommendedDays?.toString() ?? '',
    );
    const [missionPrompt, setMissionPrompt] = useState(trilha?.metadata?.missionPrompt ?? '');
    const [completionBadgeLabel, setCompletionBadgeLabel] = useState(
        trilha?.metadata?.completionBadgeLabel ?? '',
    );
    const [focusTags, setFocusTags] = useState(trilha?.metadata?.focusTags?.join(', ') ?? '');

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
            metadata: {
                heroTagline: heroTagline || undefined,
                estimatedXp: estimatedXp ? Number(estimatedXp) : undefined,
                recommendedDays: recommendedDays ? Number(recommendedDays) : undefined,
                missionPrompt: missionPrompt || undefined,
                completionBadgeLabel: completionBadgeLabel || undefined,
                focusTags: focusTags
                    .split(',')
                    .map((item) => item.trim())
                    .filter(Boolean),
            },
        });
    }

    return (
        <form className="form-trilha" onSubmit={handleSubmit}>
            <section className="form-trilha-bloco">
                <div className="form-trilha-topo">
                    <div>
                        <h3>Base da trilha</h3>
                        <p>Estrutura curricular, posicionamento e publicação.</p>
                    </div>
                </div>

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
            </section>

            <section className="form-trilha-bloco form-trilha-bloco-destaque">
                <div className="form-trilha-topo">
                    <div>
                        <h3>Camada de engajamento</h3>
                        <p>Mensagem, recompensa e foco que guiam a experiência do aluno.</p>
                    </div>
                </div>

                <CampoFormulario label="Tagline de entrada">
                    <input
                        type="text"
                        value={heroTagline}
                        onChange={(e) => setHeroTagline(e.target.value)}
                        placeholder="Ex: Crie interfaces reais em poucos dias"
                    />
                </CampoFormulario>

                <div className="form-trilha-extras">
                    <CampoFormulario label="XP estimado">
                        <input
                            type="number"
                            value={estimatedXp}
                            onChange={(e) => setEstimatedXp(e.target.value)}
                            placeholder="Ex: 320"
                            min="0"
                        />
                    </CampoFormulario>

                    <CampoFormulario label="Dias recomendados">
                        <input
                            type="number"
                            value={recommendedDays}
                            onChange={(e) => setRecommendedDays(e.target.value)}
                            placeholder="Ex: 7"
                            min="1"
                        />
                    </CampoFormulario>

                    <CampoFormulario label="Badge de conclusão">
                        <input
                            type="text"
                            value={completionBadgeLabel}
                            onChange={(e) => setCompletionBadgeLabel(e.target.value)}
                            placeholder="Ex: Front-end Sprint"
                        />
                    </CampoFormulario>
                </div>

                <CampoFormulario label="Missão sugerida">
                    <textarea
                        value={missionPrompt}
                        onChange={(e) => setMissionPrompt(e.target.value)}
                        placeholder="Ex: Complete os 3 primeiros conteúdos e publique seu primeiro layout."
                    />
                </CampoFormulario>

                <CampoFormulario label="Tags de foco">
                    <input
                        type="text"
                        value={focusTags}
                        onChange={(e) => setFocusTags(e.target.value)}
                        placeholder="Ex: html, css, responsividade, layout"
                    />
                </CampoFormulario>
            </section>

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
