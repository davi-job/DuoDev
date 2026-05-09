export type categoria = {
    id: string;
    nome: string;
};

export type trilha = {
    id: string;
    nome: string;
};

export type aula = {
    id: string;
    trilha_id: string;
    titulo: string;
    descricao: string;
    imagens: Array<string>;
};

export type questao = {
    id: string;
    trilha_id: string;
    titulo: string;
    descricao: string;
    imagens: Array<string>;
    alternativas: Array<string>;
    resposta: string;
};
