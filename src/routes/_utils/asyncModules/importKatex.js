export const importKatex = () =>
  Promise.all([
    import('katex'),
    import('katex/dist/katex.min.css')
  ]).then(e => e[0].default)
