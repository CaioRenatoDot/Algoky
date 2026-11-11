// Aplica o tema antes da primeira pintura para evitar flash (arquivo separado por causa da CSP).
try {
  var t = localStorage.getItem('algoky:theme');
  var dark = t === 'dark' || (t !== 'light' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
} catch {
  document.documentElement.dataset.theme = 'light';
}
