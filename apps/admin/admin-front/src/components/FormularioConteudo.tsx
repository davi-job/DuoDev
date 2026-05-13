import { useState } from 'react';
import { PlusIcon, XIcon } from 'lucide-react';

import CampoFormulario from './CampoFormulario';
import StatusPill from './StatusPill';
import EditorElementos from './EditorElementos';

import type {
    ItemConteudo,
    Aula,
    Questao,
    Desafio,
    TipoConteudo,
    StatusConteudo,
    Alternative,
    LessonElement,
    CreateAulaDto,
    CreateQuestaoDto,
    CreateDesafioDto,
} from '../types';

import './FormularioConteudo.css';

const TIPO_CONFIG: Record<TipoConteudo, { label: string; cor: string }> = {
    aula:    { label: 'Aula',    cor: '#5B9BD5' },
    questao: { label: 'Questão', cor: '#C792EA' },
    desafio: { label: 'Desafio', cor: '#FF8A65' },
};

const STATUS_CONTEUDO: { valor: StatusConteudo; label: string; cor: 'verde' | 'amarelo' | 'azul' }[] = [
    { valor: 'publicado', label: 'Publicado', cor: 'verde' },
    { valor: 'rascunho',  label: 'Rascunho',  cor: 'amarelo' },
    { valor: 'arquivado', label: 'Arquivado',  cor: 'azul' },
];

interface FormularioConteudoProps {
    item?: ItemConteudo;
    trailId: string;
    nextOrder: number;
    onSalvar: (tipo: TipoConteudo, dto: CreateAulaDto | CreateQuestaoDto | CreateDesafioDto) => void;
    onCancelar: () => void;
}

function FormularioConteudo({ item, trailId, nextOrder, onSalvar, onCancelar }: FormularioConteudoProps) {
    const isEdicao = !!item;

    const [tipo, setTipo] = useState<TipoConteudo>(item?.type ?? 'aula');
    const [title, setTitle] = useState(item?.title ?? '');
    const [description, setDescription] = useState(
        (item as Questao | Desafio | undefined)?.description ?? '',
    );
    const [status, setStatus] = useState<StatusConteudo>(item?.status ?? 'rascunho');

    // Aula
    const [elementos, setElementos] = useState<LessonElement[]>(
        (item as Aula | undefined)?.elements ?? [],
    );

    // Questão
    const [alternatives, setAlternatives] = useState<Alternative[]>(
        (item as Questao | undefined)?.alternatives ?? [],
    );
    const [answer, setAnswer] = useState((item as Questao | undefined)?.answer ?? '');

    // Desafio
    const [instructions, setInstructions] = useState(
        (item as Desafio | undefined)?.instructions ?? '',
    );

    function adicionarAlternativa() {
        setAlternatives((prev) => [...prev, { id: crypto.randomUUID(), text: '' }]);
    }

    function atualizarAlternativa(id: string, text: string) {
        setAlternatives((prev) => prev.map((a) => (a.id === id ? { ...a, text } : a)));
    }

    function removerAlternativa(id: string) {
        setAlternatives((prev) => prev.filter((a) => a.id !== id));
        if (answer === id) setAnswer('');
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const baseComum = { trailId, order: item?.order ?? nextOrder, title, status };

        if (tipo === 'aula') {
            onSalvar(tipo, { ...baseComum, elements: elementos });
        } else if (tipo === 'questao') {
            onSalvar(tipo, { ...baseComum, description: description || undefined, alternatives, answer });
        } else {
            onSalvar(tipo, { ...baseComum, description: description || undefined, instructions: instructions || undefined });
        }
    }

    return (
        <form className="form-conteudo" onSubmit={handleSubmit}>
            {!isEdicao && (
                <CampoFormulario label="Tipo">
                    <div className="tipo-opcoes">
                        {(Object.entries(TIPO_CONFIG) as [TipoConteudo, { label: string; cor: string }][]).map(
                            ([t, cfg]) => (
                                <button
                                    key={t}
                                    type="button"
                                    className={`tipo-opcao ${tipo === t ? 'selecionado' : ''}`}
                                    style={tipo === t ? { borderColor: cfg.cor, color: cfg.cor } : undefined}
                                    onClick={() => setTipo(t)}
                                >
                                    {cfg.label}
                                </button>
                            ),
                        )}
                    </div>
                </CampoFormulario>
            )}

            <CampoFormulario label="Título">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Introdução ao HTML"
                    required
                />
            </CampoFormulario>

            {tipo !== 'aula' && (
                <CampoFormulario label="Descrição">
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Descreva brevemente este conteúdo..."
                    />
                </CampoFormulario>
            )}

            {tipo === 'aula' && (
                <CampoFormulario label="Elementos">
                    <EditorElementos elements={elementos} onChange={setElementos} />
                </CampoFormulario>
            )}

            {tipo === 'questao' && (
                <CampoFormulario label="Alternativas">
                    <div className="alternativas">
                        {alternatives.map((alt) => (
                            <div key={alt.id} className="alternativa">
                                <input
                                    type="radio"
                                    name="resposta"
                                    className="alternativa-radio"
                                    checked={answer === alt.id}
                                    onChange={() => setAnswer(alt.id)}
                                    title="Marcar como resposta correta"
                                />
                                <input
                                    type="text"
                                    className="alternativa-texto"
                                    value={alt.text}
                                    onChange={(e) => atualizarAlternativa(alt.id, e.target.value)}
                                    placeholder="Texto da alternativa"
                                    required
                                />
                                <button
                                    type="button"
                                    className="alternativa-remover"
                                    onClick={() => removerAlternativa(alt.id)}
                                    aria-label="Remover alternativa"
                                >
                                    <XIcon size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            className="btn-add-alternativa"
                            onClick={adicionarAlternativa}
                        >
                            <PlusIcon size={14} />
                            Adicionar alternativa
                        </button>
                    </div>
                </CampoFormulario>
            )}

            {tipo === 'desafio' && (
                <CampoFormulario label="Instruções">
                    <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        placeholder="Descreva as instruções do desafio..."
                        rows={5}
                    />
                </CampoFormulario>
            )}

            <CampoFormulario label="Status">
                <div className="status-opcoes">
                    {STATUS_CONTEUDO.map(({ valor, label, cor }) => (
                        <button
                            key={valor}
                            type="button"
                            className={`status-opcao ${status === valor ? 'selecionado' : ''}`}
                            onClick={() => setStatus(valor)}
                        >
                            <StatusPill cor={cor} texto={label} />
                        </button>
                    ))}
                </div>
            </CampoFormulario>

            <div className="form-acoes">
                <button type="button" className="btn-cancelar" onClick={onCancelar}>
                    Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                    {isEdicao ? 'Salvar Alterações' : `Criar ${TIPO_CONFIG[tipo].label}`}
                </button>
            </div>
        </form>
    );
}

export default FormularioConteudo;
