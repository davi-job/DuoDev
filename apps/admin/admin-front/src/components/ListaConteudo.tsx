import { GripVerticalIcon } from 'lucide-react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import BotaoAcoes from './BotaoAcoes';
import StatusPill from './StatusPill';
import type { ItemConteudo } from '../types';

import './ListaConteudo.css';

const TIPO_CONFIG = {
    aula:    { label: 'Aula',    cor: '#5B9BD5' },
    questao: { label: 'Questão', cor: '#C792EA' },
    desafio: { label: 'Desafio', cor: '#FF8A65' },
};

const STATUS_COR: Record<string, 'verde' | 'amarelo' | 'azul'> = {
    publicado: 'verde',
    rascunho:  'amarelo',
    arquivado: 'azul',
};

const STATUS_LABEL: Record<string, string> = {
    publicado: 'Publicado',
    rascunho:  'Rascunho',
    arquivado: 'Arquivado',
};

interface ItemRowProps {
    item: ItemConteudo;
    onEditar: () => void;
    onExcluir: () => void;
}

function ItemRow({ item, onEditar, onExcluir }: ItemRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: item.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    const tipo = TIPO_CONFIG[item.type];

    return (
        <div ref={setNodeRef} style={style} className="conteudo-item">
            <button
                className="conteudo-drag"
                {...attributes}
                {...listeners}
                type="button"
                aria-label="Arrastar"
            >
                <GripVerticalIcon size={16} />
            </button>

            <span
                className="conteudo-tipo-badge"
                style={{ backgroundColor: `${tipo.cor}20`, color: tipo.cor }}
            >
                {tipo.label}
            </span>

            <span className="conteudo-titulo">{item.title}</span>

            <div className="conteudo-status">
                <StatusPill
                    cor={STATUS_COR[item.status] ?? 'amarelo'}
                    texto={STATUS_LABEL[item.status] ?? item.status}
                />
            </div>

            <BotaoAcoes onEditar={onEditar} onExcluir={onExcluir} />
        </div>
    );
}

interface ListaConteudoProps {
    items: ItemConteudo[];
    onEditar: (item: ItemConteudo) => void;
    onExcluir: (item: ItemConteudo) => void;
    onReordenar: (items: ItemConteudo[]) => void;
}

function ListaConteudo({ items, onEditar, onExcluir, onReordenar }: ListaConteudoProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = items.findIndex((i) => i.id === String(active.id));
        const newIndex = items.findIndex((i) => i.id === String(over.id));
        const reordered = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
            ...item,
            order: index,
        }));
        onReordenar(reordered);
    }

    if (items.length === 0) {
        return (
            <div className="conteudo-vazio">
                Nenhum conteúdo adicionado ainda.
            </div>
        );
    }

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
        >
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <div className="lista-conteudo">
                    {items.map((item) => (
                        <ItemRow
                            key={item.id}
                            item={item}
                            onEditar={() => onEditar(item)}
                            onExcluir={() => onExcluir(item)}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
}

export default ListaConteudo;
