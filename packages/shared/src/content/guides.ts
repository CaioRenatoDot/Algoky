/**
 * Guias de estudo: textos curtos e práticos que complementam os padrões.
 * Trechos entre crases viram código inline na interface.
 */
export interface GuideSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
  /** Lista numerada (passos). */
  steps?: Array<{ title: string; text: string }>;
  table?: { head: string[]; rows: string[][] };
  /** Trecho de código exibido com destaque de sintaxe. */
  code?: { language: 'python' | 'typescript' | 'java'; source: string };
}

export interface Guide {
  slug: string;
  title: string;
  summary: string;
  minutes: number;
  sections: GuideSection[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'como-resolver-um-problema',
    title: 'Como resolver um problema em 6 passos',
    summary:
      'Um roteiro para não travar diante de um enunciado novo, do entendimento ao teste final.',
    minutes: 6,
    sections: [
      {
        heading: 'Por que ter um roteiro',
        paragraphs: [
          'A maior parte do tempo perdido em problemas de algoritmos não é escrevendo código, é começando a escrever código cedo demais. Um roteiro fixo tira a decisão do "por onde começo?" e garante que você não pule etapas quando estiver nervoso, numa entrevista ou num contest.',
        ],
      },
      {
        heading: 'Os passos',
        steps: [
          {
            title: 'Entenda o enunciado',
            text: 'Reescreva o problema com suas palavras. Identifique a entrada, a saída e as restrições (tamanho de `n`, intervalo dos valores, se há negativos ou repetidos). As restrições dizem qual complexidade é aceitável.',
          },
          {
            title: 'Monte exemplos e casos de borda',
            text: 'Faça 2 ou 3 exemplos à mão, incluindo os chatos: vazio, um elemento, todos iguais, valores negativos, resposta inexistente. Muitos bugs aparecem aqui, antes de existir código.',
          },
          {
            title: 'Comece pela força bruta',
            text: 'Descreva a solução mais simples que funciona, mesmo que seja O(n²) ou exponencial, e diga sua complexidade. Ela é a sua rede de segurança e o ponto de partida da otimização.',
          },
          {
            title: 'Procure o padrão',
            text: 'Olhe para os sinais: array ordenado sugere two pointers ou busca binária; subarray contíguo sugere sliding window ou prefix sum; "todas as combinações" sugere backtracking; "número de maneiras" sugere DP. Pergunte: qual trabalho a força bruta repete?',
          },
          {
            title: 'Planeje e codifique',
            text: 'Escreva o plano em 3 a 5 linhas antes do código. Depois codifique com nomes claros, pequenas funções auxiliares e sem otimizações prematuras.',
          },
          {
            title: 'Teste e analise',
            text: 'Rode os exemplos do passo 2 linha a linha, mentalmente ou no papel. Corrija, e só então declare a complexidade final de tempo e espaço.',
          },
        ],
      },
      {
        heading: 'Quando travar',
        list: [
          'Volte aos exemplos: resolva um caso pequeno à mão e observe o que você mesmo fez.',
          'Simplifique o problema: e se o array estivesse ordenado? E se fossem só dois elementos?',
          'Pense no que precisaria saber "do passado" para responder no elemento atual: geralmente é um hash map, uma pilha ou um estado de DP.',
          'Depois de 20 a 30 minutos sem progresso, veja uma dica (não a solução inteira) e anote o que faltou perceber.',
        ],
      },
    ],
  },
  {
    slug: 'plano-de-estudo',
    title: 'Plano de estudo de 8 semanas',
    summary: 'Uma divisão semanal da trilha para quem tem cerca de uma hora por dia.',
    minutes: 5,
    sections: [
      {
        heading: 'A rotina diária',
        paragraphs: [
          'Constância vence intensidade. Uma hora por dia durante oito semanas rende mais do que maratonas de fim de semana, porque a revisão espaçada precisa de dias para funcionar.',
        ],
        list: [
          '10 minutos: revisões do dia (fila de revisão do Algoky).',
          '40 minutos: um problema novo do padrão da semana, seguindo o roteiro de 6 passos.',
          '10 minutos: anotar a ideia-chave e a complexidade nas notas do problema.',
        ],
      },
      {
        heading: 'As semanas',
        table: {
          head: ['Semana', 'Padrões', 'Foco'],
          rows: [
            [
              '1',
              'Arrays & Hashing, Two Pointers',
              'Trocar espaço por tempo; ponteiros em array ordenado',
            ],
            ['2', 'Sliding Window, Prefix Sum', 'Subarrays contíguos; contagem com hash map'],
            ['3', 'Stack, Binary Search', 'Pilha monotônica; busca na resposta'],
            ['4', 'Linked List, Árvores (DFS e BFS)', 'Ponteiros, recursão e travessias'],
            [
              '5',
              'Heap, Intervals, Backtracking',
              'Top K, ordenação por início, gerar combinações',
            ],
            [
              '6',
              'Graphs, Topological Sort, Union-Find',
              'Modelar como grafo; dependências; componentes',
            ],
            ['7', 'Trie, Greedy, DP 1D', 'Prefixos; escolhas locais; estado e recorrência'],
            ['8', 'DP 2D, Bits, Matriz', 'Duas dimensões; revisão geral dos essenciais'],
          ],
        },
      },
      {
        heading: 'Dicas',
        list: [
          'Priorize os problemas marcados como essenciais; os demais são para aprofundar.',
          'Se uma semana atrasar, siga para a próxima e volte depois: a ordem importa mais que o ritmo exato.',
          'No fim de cada semana, refaça sem consultar um problema da semana anterior.',
        ],
      },
    ],
  },
  {
    slug: 'como-revisar',
    title: 'Como revisar sem esquecer',
    summary: 'Por que resolver uma vez não basta e como a revisão espaçada do Algoky funciona.',
    minutes: 4,
    sections: [
      {
        heading: 'A curva do esquecimento',
        paragraphs: [
          'Sem revisão, esquecemos a maior parte do que aprendemos em poucos dias. A boa notícia: cada revisão feita no momento certo, logo antes de esquecer, faz a memória durar bem mais. É o princípio da revisão espaçada.',
        ],
      },
      {
        heading: 'Como o Algoky agenda',
        list: [
          'Ao resolver, você informa a confiança (1 a 5). Quanto mais confiante, mais tarde vem a primeira revisão (de 1 a 7 dias).',
          'Na revisão, você responde Errei, Difícil, Bom ou Fácil. Lembrar bem faz o intervalo crescer: 3 dias, uma semana, um mês. Esquecer traz o problema de volta amanhã.',
          'O intervalo máximo é de 180 dias.',
        ],
      },
      {
        heading: 'O que é revisar um problema',
        paragraphs: [
          'Revisar não é refazer o código inteiro. É recuperar, sem olhar: qual padrão resolve, qual a ideia-chave e qual a complexidade. Se você consegue explicar isso em 30 segundos, conta como "Bom". Se travar, abra o problema e resolva de novo: isso conta como "Errei", e tudo bem.',
        ],
      },
      {
        heading: 'Escreva notas que ajudam o seu eu do futuro',
        list: [
          'A ideia em uma frase: `hash map valor → índice; para cada x, procurar alvo - x`.',
          'O detalhe que fez você errar: `checar o complemento antes de inserir`.',
          'A complexidade: `O(n) tempo, O(n) espaço`.',
        ],
      },
    ],
  },
  {
    slug: 'na-entrevista',
    title: 'Na entrevista: como se comunicar',
    summary: 'O que o entrevistador avalia além do código e como conduzir os 45 minutos.',
    minutes: 5,
    sections: [
      {
        heading: 'O que está sendo avaliado',
        list: [
          'Comunicação: você explica o que está pensando e escuta as dicas.',
          'Resolução de problemas: parte do simples, raciocina sobre trade-offs e chega a uma solução melhor.',
          'Código: correto, legível e com casos de borda tratados.',
          'Verificação: você testa o próprio código antes de dizer que terminou.',
        ],
      },
      {
        heading: 'Um roteiro para 45 minutos',
        table: {
          head: ['Tempo', 'O que fazer'],
          rows: [
            ['0–5 min', 'Repetir o problema, perguntar sobre restrições e casos de borda'],
            ['5–10 min', 'Exemplos à mão e força bruta com complexidade'],
            ['10–20 min', 'Otimizar em voz alta e combinar a abordagem com o entrevistador'],
            ['20–35 min', 'Codificar explicando as partes principais'],
            ['35–45 min', 'Testar com os exemplos, corrigir e discutir complexidade e melhorias'],
          ],
        },
      },
      {
        heading: 'Frases que ajudam',
        list: [
          '"Antes de codar, posso confirmar se a entrada pode ser vazia?"',
          '"A força bruta seria O(n²) comparando todos os pares; acho que dá para melhorar com um hash map."',
          '"Vou testar com o exemplo pequeno que fizemos antes."',
          '"Se tivesse mais tempo, eu trataria tal caso assim."',
        ],
      },
    ],
  },
];

export const GUIDES_BY_SLUG: ReadonlyMap<string, Guide> = new Map(GUIDES.map((g) => [g.slug, g]));
