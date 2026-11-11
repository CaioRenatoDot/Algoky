import type { Pattern } from '../../types.ts';

export const trie: Pattern = {
  id: 'trie',
  name: 'Trie',
  order: 16,
  tagline: 'Uma árvore de prefixos para buscar palavras letra a letra.',
  description: [
    'Uma Trie guarda strings como caminhos numa árvore: cada aresta é um caractere e cada nó marca se uma palavra termina ali. Inserir e buscar custam O(L), o tamanho da palavra, independentemente de quantas palavras existem.',
    'Ela brilha em buscas por prefixo (autocomplete) e quando você precisa procurar muitas palavras ao mesmo tempo, como no Word Search II, onde a Trie poda a DFS na grade assim que o prefixo deixa de existir.',
  ],
  signals: [
    'Buscas por prefixo ou autocomplete',
    'Dicionário de palavras com consultas repetidas',
    'Procurar muitas palavras numa grade ou texto',
  ],
  complexity: { time: 'O(L) por operação', space: 'O(total de caracteres)' },
  pitfalls: [
    'Confundir "prefixo existe" com "palavra existe" (flag de fim)',
    'Não podar a Trie no Word Search II (estoura o tempo)',
  ],
  prerequisites: ['trees-dfs'],
  templates: {
    python: `class Trie:
    def __init__(self):
        self.children: dict[str, "Trie"] = {}
        self.is_word = False

    def insert(self, word: str) -> None:
        node = self
        for ch in word:
            node = node.children.setdefault(ch, Trie())
        node.is_word = True

    def _walk(self, s: str):
        node = self
        for ch in s:
            node = node.children.get(ch)
            if node is None:
                return None
        return node

    def search(self, word: str) -> bool:
        node = self._walk(word)
        return bool(node and node.is_word)

    def starts_with(self, prefix: str) -> bool:
        return self._walk(prefix) is not None`,
    typescript: `class Trie {
  children = new Map<string, Trie>();
  isWord = false;

  insert(word: string): void {
    let node: Trie = this;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new Trie());
      node = node.children.get(ch)!;
    }
    node.isWord = true;
  }

  private walk(s: string): Trie | undefined {
    let node: Trie | undefined = this;
    for (const ch of s) node = node?.children.get(ch);
    return node;
  }

  search(word: string): boolean {
    return this.walk(word)?.isWord ?? false;
  }

  startsWith(prefix: string): boolean {
    return this.walk(prefix) !== undefined;
  }
}`,
    java: `class Trie {
    private final Trie[] children = new Trie[26];
    private boolean isWord;

    void insert(String word) {
        Trie node = this;
        for (char ch : word.toCharArray()) {
            int i = ch - 'a';
            if (node.children[i] == null) node.children[i] = new Trie();
            node = node.children[i];
        }
        node.isWord = true;
    }

    private Trie walk(String s) {
        Trie node = this;
        for (char ch : s.toCharArray()) {
            node = node.children[ch - 'a'];
            if (node == null) return null;
        }
        return node;
    }

    boolean search(String word) { Trie n = walk(word); return n != null && n.isWord; }

    boolean startsWith(String prefix) { return walk(prefix) != null; }
}`,
  },
};
