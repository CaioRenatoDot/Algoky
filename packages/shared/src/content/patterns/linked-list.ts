import type { Pattern } from '../../types.ts';

export const linkedList: Pattern = {
  id: 'linked-list',
  name: 'Linked List & Fast/Slow',
  order: 7,
  tagline: 'Manipule ponteiros com cuidado e use dois ritmos de passo.',
  description: [
    'Problemas de lista ligada testam manipulação precisa de ponteiros. Três ferramentas resolvem quase tudo: um nó sentinela (dummy) para evitar casos especiais na cabeça, reversão in-place e os ponteiros rápido/lento.',
    'Com fast andando 2 passos e slow 1, slow para no meio da lista. Se houver ciclo, os dois se encontram (algoritmo de Floyd). A mesma ideia acha o início do ciclo e o n-ésimo nó a partir do fim.',
    'Desenhe os ponteiros antes de codar e anote a ordem das atribuições: perder a referência para `next` é o erro mais comum.',
  ],
  signals: [
    'Entrada é uma lista ligada',
    'Detectar ciclo ou achar o meio',
    'Reverter a lista inteira ou parte dela',
    'Mesclar listas ordenadas',
  ],
  complexity: { time: 'O(n)', space: 'O(1)' },
  pitfalls: [
    'Perder a referência para o próximo nó durante a reversão',
    'Não tratar lista vazia ou com um nó',
    'Checar `fast.next.next` sem antes checar `fast.next`',
  ],
  prerequisites: ['two-pointers'],
  templates: {
    python: `def reverse_list(head):
    prev = None
    while head:
        nxt = head.next   # guarde antes de sobrescrever
        head.next = prev
        prev, head = head, nxt
    return prev

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    return slow`,
    typescript: `function reverseList(head: ListNode | null): ListNode | null {
  let prev: ListNode | null = null;
  while (head) {
    const next = head.next; // guarde antes de sobrescrever
    head.next = prev;
    prev = head;
    head = next;
  }
  return prev;
}

function middle(head: ListNode | null): ListNode | null {
  let slow = head;
  let fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
  }
  return slow;
}`,
    java: `ListNode reverseList(ListNode head) {
    ListNode prev = null;
    while (head != null) {
        ListNode next = head.next; // guarde antes de sobrescrever
        head.next = prev;
        prev = head;
        head = next;
    }
    return prev;
}

ListNode middle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
    }
    return slow;
}`,
  },
};
