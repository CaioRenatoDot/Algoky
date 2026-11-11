import type { Pattern } from '../../types.ts';
import { arraysHashing } from './arrays-hashing.ts';
import { backtracking } from './backtracking.ts';
import { binarySearch } from './binary-search.ts';
import { bitManipulation } from './bit-manipulation.ts';
import { dp1d } from './dp-1d.ts';
import { dp2d } from './dp-2d.ts';
import { graphs } from './graphs.ts';
import { greedy } from './greedy.ts';
import { heap } from './heap.ts';
import { intervals } from './intervals.ts';
import { linkedList } from './linked-list.ts';
import { matrixMath } from './matrix-math.ts';
import { prefixSum } from './prefix-sum.ts';
import { slidingWindow } from './sliding-window.ts';
import { stack } from './stack.ts';
import { topologicalSort } from './topological-sort.ts';
import { treesBfs } from './trees-bfs.ts';
import { treesDfs } from './trees-dfs.ts';
import { trie } from './trie.ts';
import { twoPointers } from './two-pointers.ts';
import { unionFind } from './union-find.ts';

/** Todos os padrões, na ordem sugerida de estudo. */
export const PATTERNS: Pattern[] = [
  arraysHashing,
  twoPointers,
  slidingWindow,
  prefixSum,
  stack,
  binarySearch,
  linkedList,
  treesDfs,
  treesBfs,
  heap,
  intervals,
  backtracking,
  graphs,
  topologicalSort,
  unionFind,
  trie,
  greedy,
  dp1d,
  dp2d,
  bitManipulation,
  matrixMath,
].sort((a, b) => a.order - b.order);

export const PATTERNS_BY_ID: ReadonlyMap<string, Pattern> = new Map(PATTERNS.map((p) => [p.id, p]));
