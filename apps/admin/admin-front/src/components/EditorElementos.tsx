import { GripVerticalIcon, PlusIcon, XIcon } from 'lucide-react';
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

import type { LessonElement } from '../types';
import './EditorElementos.css';

interface ElementRowProps {
    element: LessonElement;
    onChange: (content: string) => void;
    onRemove: () => void;
}

function ElementRow({ element, onChange, onRemove }: ElementRowProps) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
        useSortable({ id: element.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
    };

    return (
        <div ref={setNodeRef} style={style} className="elemento-row">
            <button
                className="elemento-drag"
                type="button"
                aria-label="Arrastar"
                {...attributes}
                {...listeners}
            >
                <GripVerticalIcon size={16} />
            </button>

            <div className="elemento-corpo">
                <span className={`elemento-tipo-badge elemento-tipo-${element.type}`}>
                    {element.type === 'texto' ? 'Texto' : 'Imagem'}
                </span>

                {element.type === 'texto' ? (
                    <textarea
                        className="elemento-input"
                        value={element.content}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="Escreva o conteúdo do texto..."
                        rows={3}
                    />
                ) : (
                    <input
                        className="elemento-input"
                        type="text"
                        value={element.content}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://exemplo.com/imagem.png"
                    />
                )}
            </div>

            <button
                className="elemento-remover"
                type="button"
                aria-label="Remover elemento"
                onClick={onRemove}
            >
                <XIcon size={14} />
            </button>
        </div>
    );
}

interface EditorElementosProps {
    elements: LessonElement[];
    onChange: (elements: LessonElement[]) => void;
}

function EditorElementos({ elements, onChange }: EditorElementosProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = elements.findIndex((e) => e.id === String(active.id));
        const newIndex = elements.findIndex((e) => e.id === String(over.id));
        const reordered = arrayMove(elements, oldIndex, newIndex).map((el, i) => ({
            ...el,
            order: i,
        }));
        onChange(reordered);
    }

    function adicionar(type: 'texto' | 'imagem') {
        onChange([
            ...elements,
            { id: crypto.randomUUID(), type, content: '', order: elements.length },
        ]);
    }

    function atualizar(id: string, content: string) {
        onChange(elements.map((e) => (e.id === id ? { ...e, content } : e)));
    }

    function remover(id: string) {
        onChange(
            elements
                .filter((e) => e.id !== id)
                .map((e, i) => ({ ...e, order: i })),
        );
    }

    return (
        <div className="editor-elementos">
            {elements.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={elements.map((e) => e.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="elementos-lista">
                            {elements.map((el) => (
                                <ElementRow
                                    key={el.id}
                                    element={el}
                                    onChange={(c) => atualizar(el.id, c)}
                                    onRemove={() => remover(el.id)}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            )}

            <div className="elementos-botoes">
                <button
                    type="button"
                    className="btn-add-elemento"
                    onClick={() => adicionar('texto')}
                >
                    <PlusIcon size={14} />
                    Texto
                </button>
                <button
                    type="button"
                    className="btn-add-elemento imagem"
                    onClick={() => adicionar('imagem')}
                >
                    <PlusIcon size={14} />
                    Imagem
                </button>
            </div>
        </div>
    );
}

export default EditorElementos;
