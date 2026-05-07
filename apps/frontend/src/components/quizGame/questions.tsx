import type { Question } from '../types/types';

export const questions: Question[] = [
    {
        id: 1,
        type: 'fill-blank',
        question: "Complete a linha que imprime 'Olá, Mundo!' em Python:",
        sentence: "___ ( 'Olá, Mundo!' )",
        blanks: ['print', 'input', 'return', 'write', 'echo'],
        correctOrder: ['print'],
    },
    {
        id: 2,
        type: 'multiple-choice',
        question: 'Qual das alternativas representa corretamente uma lista em Python?',
        options: [
            { label: 'A', text: 'lista = (1, 2, 3)' },
            { label: 'B', text: 'lista = [1, 2, 3]' },
            { label: 'C', text: 'lista = {1, 2, 3}' },
            { label: 'D', text: 'lista = <1, 2, 3>' },
        ],
        correct: 'B',
    },
    {
        id: 3,
        type: 'code-reading',
        question: 'O que o código abaixo irá imprimir?',
        code: `x = 10
y = 3
print(x % y)`,
        options: [
            { label: 'A', text: '3' },
            { label: 'B', text: '3.33' },
            { label: 'C', text: '1' },
            { label: 'D', text: '0' },
        ],
        correct: 'C',
    },
    {
        id: 4,
        type: 'multiple-choice',
        question: 'Qual palavra-chave é usada para definir uma função em Python?',
        options: [
            { label: 'A', text: 'function' },
            { label: 'B', text: 'func' },
            { label: 'C', text: 'def' },
            { label: 'D', text: 'define' },
        ],
        correct: 'C',
    },
    {
        id: 5,
        type: 'fill-blank',
        question: 'Complete o laço que repete 5 vezes, de 0 a 4:',
        sentence: '___ i ___ range(5):\n    print(i)',
        blanks: ['for', 'in', 'while', 'if', 'each'],
        correctOrder: ['for', 'in'],
    },
    {
        id: 6,
        type: 'multiple-choice',
        question: 'Como se verifica o tipo de uma variável em Python?',
        options: [
            { label: 'A', text: 'typeof(x)' },
            { label: 'B', text: 'x.type()' },
            { label: 'C', text: 'type(x)' },
            { label: 'D', text: 'gettype(x)' },
        ],
        correct: 'C',
    },
    {
        id: 7,
        type: 'code-reading',
        question: 'O que o código abaixo irá imprimir?',
        code: `lista = [10, 20, 30, 40]
print(lista[-1])`,
        options: [
            { label: 'A', text: '10' },
            { label: 'B', text: '30' },
            { label: 'C', text: '40' },
            { label: 'D', text: 'Erro' },
        ],
        correct: 'C',
    },
    {
        id: 8,
        type: 'multiple-choice',
        question: 'Qual o resultado de "Hello" + " " + "World" em Python?',
        options: [
            { label: 'A', text: 'Hello World' },
            { label: 'B', text: 'HelloWorld' },
            { label: 'C', text: 'Erro' },
            { label: 'D', text: '"Hello" " " "World"' },
        ],
        correct: 'A',
    },
    {
        id: 9,
        type: 'code-reading',
        question: 'O que será impresso?',
        code: `idade = 15
if idade >= 18:
    print("Adulto")
else:
    print("Menor")`,
        options: [
            { label: 'A', text: 'Adulto' },
            { label: 'B', text: 'Menor' },
            { label: 'C', text: '15' },
            { label: 'D', text: 'Erro' },
        ],
        correct: 'B',
    },
    {
        id: 10,
        type: 'fill-blank',
        question: 'Complete o código que lê uma entrada do usuário:',
        sentence: 'nome = ___( "Digite seu nome: " )',
        blanks: ['input', 'print', 'read', 'scan', 'get'],
        correctOrder: ['input'],
    },
];
