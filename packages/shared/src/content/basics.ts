import type { Guide } from './guides.ts';

/**
 * "Comece aqui": introdução para quem nunca estudou algoritmos.
 * Mesmo formato dos guias, lido em sequência numa única página.
 */
export const BASICS: Guide[] = [
  {
    slug: 'o-que-e-um-algoritmo',
    title: 'O que é um algoritmo',
    summary: 'Uma receita de passos bem definidos para resolver um problema.',
    minutes: 3,
    sections: [
      {
        heading: 'A ideia',
        paragraphs: [
          'Um algoritmo é uma sequência finita de passos que transforma uma entrada numa saída. Uma receita de bolo é um algoritmo: ingredientes (entrada), modo de preparo (passos) e o bolo (saída). Em programação, a diferença é que cada passo precisa ser preciso o bastante para um computador executar.',
          'O mesmo problema pode ter vários algoritmos, e alguns são muito mais rápidos que outros. Estudar algoritmos é aprender a escolher (e inventar) os bons.',
        ],
      },
      {
        heading: 'Um exemplo do dia a dia',
        paragraphs: [
          'Procurar uma palavra num dicionário de 1.000 páginas. Um jeito é ler página por página desde o início: no pior caso, 1.000 páginas. Outro jeito é abrir no meio, ver se a palavra vem antes ou depois e descartar metade do livro, repetindo o processo: no máximo umas 10 aberturas. O segundo jeito é a busca binária, um dos padrões que você vai estudar aqui.',
        ],
        code: {
          language: 'python',
          source: `def busca_linear(lista, alvo):
    for i, valor in enumerate(lista):   # olha um por um
        if valor == alvo:
            return i
    return -1

def busca_binaria(lista_ordenada, alvo):
    inicio, fim = 0, len(lista_ordenada) - 1
    while inicio <= fim:
        meio = (inicio + fim) // 2      # abre no meio
        if lista_ordenada[meio] == alvo:
            return meio
        if lista_ordenada[meio] < alvo:
            inicio = meio + 1           # descarta a metade da esquerda
        else:
            fim = meio - 1              # descarta a metade da direita
    return -1`,
        },
      },
      {
        heading: 'O que você precisa saber antes',
        list: [
          'O básico de uma linguagem de programação: variáveis, condicionais (`if`), laços (`for`, `while`) e funções.',
          'Como usar listas/arrays e dicionários (hash maps) na sua linguagem.',
          'Se ainda não programa, comece por um curso introdutório de Python: é a linguagem mais simples para estudar algoritmos.',
        ],
      },
    ],
  },
  {
    slug: 'estruturas-de-dados',
    title: 'Estruturas de dados essenciais',
    summary: 'As formas de organizar dados que aparecem em quase todo problema.',
    minutes: 4,
    sections: [
      {
        heading: 'Por que importam',
        paragraphs: [
          'Uma estrutura de dados é uma forma de guardar informação para que certas operações fiquem rápidas. Escolher a estrutura certa costuma ser metade da solução: um problema que parece exigir comparar todos os pares vira uma passada só com um hash map.',
        ],
      },
      {
        heading: 'As principais',
        table: {
          head: ['Estrutura', 'O que é', 'Bom para'],
          rows: [
            [
              'Array / lista',
              'Elementos em sequência, acessados por índice',
              'Acesso rápido por posição, percorrer em ordem',
            ],
            [
              'Hash map / dicionário',
              'Pares chave → valor',
              'Saber em O(1) se algo já apareceu, contar frequências',
            ],
            [
              'Pilha (stack)',
              'O último que entra é o primeiro que sai',
              'Parênteses, desfazer ações, "próximo maior"',
            ],
            [
              'Fila (queue)',
              'O primeiro que entra é o primeiro que sai',
              'Processar por ordem de chegada, BFS',
            ],
            [
              'Lista ligada',
              'Nós que apontam para o próximo',
              'Inserir e remover no meio sem deslocar elementos',
            ],
            ['Árvore', 'Nós com filhos, a partir de uma raiz', 'Hierarquias, busca ordenada (BST)'],
            [
              'Heap',
              'Árvore que mantém o menor (ou maior) no topo',
              'Pegar o "melhor" elemento repetidamente, Top K',
            ],
            ['Grafo', 'Nós ligados por arestas', 'Redes, mapas, dependências entre tarefas'],
          ],
        },
      },
    ],
  },
  {
    slug: 'big-o-sem-medo',
    title: 'Big-O sem medo',
    summary: 'Como medir se um algoritmo é rápido, sem fórmula complicada.',
    minutes: 4,
    sections: [
      {
        heading: 'A intuição',
        paragraphs: [
          'Big-O descreve como o tempo (ou a memória) de um algoritmo cresce quando a entrada cresce. Não importa se ele leva 2 ou 3 segundos; importa se, ao dobrar a entrada, o tempo dobra, quadruplica ou quase não muda.',
          'Na busca linear, se a lista dobra, o trabalho dobra: isso é O(n). Na busca binária, dobrar a lista acrescenta só um passo: isso é O(log n). Comparar todos os pares de uma lista é O(n²): dobrar a lista quadruplica o trabalho.',
        ],
      },
      {
        heading: 'Do mais rápido ao mais lento',
        table: {
          head: ['Notação', 'Nome', 'Exemplo'],
          rows: [
            ['O(1)', 'Constante', 'Acessar `lista[5]`, consultar um hash map'],
            ['O(log n)', 'Logarítmica', 'Busca binária'],
            ['O(n)', 'Linear', 'Percorrer a lista uma vez'],
            ['O(n log n)', 'Linearítmica', 'Ordenar'],
            ['O(n²)', 'Quadrática', 'Dois laços aninhados sobre a lista'],
            ['O(2ⁿ)', 'Exponencial', 'Gerar todos os subconjuntos'],
          ],
        },
      },
      {
        heading: 'A regra prática',
        list: [
          'Um laço sobre n elementos: O(n). Um laço dentro de outro: O(n²).',
          'Dividir o problema pela metade a cada passo: O(log n).',
          'Ignore constantes e termos menores: O(2n + 5) é O(n).',
          'A [referência de Big-O](/big-o) tem as tabelas completas e mostra qual complexidade cabe em cada tamanho de entrada.',
        ],
      },
    ],
  },
  {
    slug: 'entrevistas-e-competicoes',
    title: 'Entrevistas, LeetCode e programação competitiva',
    summary: 'Os três mundos onde algoritmos são cobrados e onde praticar cada um.',
    minutes: 4,
    sections: [
      {
        heading: 'Entrevistas técnicas',
        paragraphs: [
          'Muitas empresas avaliam candidatos com problemas de algoritmos de 30 a 60 minutos. O objetivo não é decorar soluções, e sim mostrar raciocínio: entender o problema, propor uma abordagem, analisar a complexidade e escrever código correto. O LeetCode virou o lugar padrão para praticar, e é dele que vêm os problemas do Algoky.',
        ],
      },
      {
        heading: 'Programação competitiva',
        paragraphs: [
          'É resolver problemas de algoritmos contra o relógio, em competições. Os problemas costumam ser mais difíceis e matemáticos que os de entrevista, e um juiz automático testa sua solução com casos secretos e limite de tempo. É uma ótima forma de ficar muito bom em algoritmos, e as habilidades transferem diretamente para entrevistas.',
        ],
        table: {
          head: ['Onde', 'O que é'],
          rows: [
            [
              'Codeforces',
              'Competições semanais com ranking (rating) e um acervo enorme de problemas',
            ],
            ['AtCoder', 'Competições japonesas; as "Beginner Contests" são ótimas para começar'],
            ['Beecrowd', 'Plataforma brasileira (antiga URI), com problemas em português'],
            [
              'OBI',
              'Olimpíada Brasileira de Informática, para estudantes do ensino fundamental ao médio',
            ],
            [
              'Maratona SBC / ICPC',
              'Competição universitária em equipes, etapa brasileira da ICPC mundial',
            ],
          ],
        },
      },
      {
        heading: 'Qual escolher',
        list: [
          'Quer passar em entrevistas: foque na trilha do Algoky e nos problemas do LeetCode.',
          'Gosta de desafio e competição: comece pelas AtCoder Beginner Contests e pelo Codeforces Div. 3/4.',
          'Os padrões são os mesmos nos dois mundos: o que você aprende aqui serve para ambos.',
        ],
      },
    ],
  },
  {
    slug: 'como-usar-o-algoky',
    title: 'Como usar o Algoky',
    summary: 'O caminho sugerido, do primeiro padrão à revisão diária.',
    minutes: 2,
    sections: [
      {
        heading: 'O caminho',
        steps: [
          {
            title: 'Leia o primeiro padrão',
            text: 'Comece por [Arrays & Hashing](/padroes/arrays-hashing). Leia a ideia, os sinais e o template.',
          },
          {
            title: 'Resolva os essenciais',
            text: 'Abra os problemas essenciais no LeetCode e tente resolvê-los seguindo o [roteiro de 6 passos](/guias/como-resolver-um-problema).',
          },
          {
            title: 'Siga a trilha',
            text: 'Avance padrão por padrão, na ordem do [sumário](/padroes). Cada um se apoia nos anteriores.',
          },
          {
            title: 'Crie uma conta para manter o ritmo',
            text: 'Com ela, o Algoky marca seu progresso, agenda revisões e mostra seu streak. É opcional e gratuito.',
          },
        ],
      },
    ],
  },
];
