# Casca

Não recrie `src/curso/styles.css` nem `src/curso/script.js`. Copie uma aula de `src/curso/content/`. Não espalhe `<style>` na aula. Mudança de visual vai em `src/curso/styles.css`, nas variáveis de `:root`. Não cole cor fixa.

O menu só monta com `yarn start`. Aberto do disco, a página avisa. O script lista `src/curso/content/` e lê `src/curso/content/modulos.json`. Pasta ou arquivo fora de `N-slug` fica de fora. O id é `m<módulo>-a<aula>`, pelos números. O título vem do JSON.

Na aula, `data-root="../../"` e os links de CSS e JS usam esse prefixo. Na home do curso, `data-root` fica vazio e não há `data-lesson`.

- Menu à esquerda. Sem lista de atalhos no topo da aula (`.page-toc`).
- Botão “Marcar como concluída” depois de `.body`, antes do rodapé. Nunca no cabeçalho.
- Progresso em `localStorage`, chave `mp-course-progress`.
- `.lesson-link` tem `border-radius: 0`. Não arredonde o nome da aula.
- Peso 800 só no `h1`. 700 em `h2`, `h3` e números. O resto, 400 a 600.
- O script preenche `#lesson-pager` com a aula anterior e a próxima. Na primeira ou na última, o lado que não existe fica de fora.

Classes já usadas nas aulas: `.section` e `.kicker`, `.grid2` ou `.grid3` com `.card`, `.formula` e `.equation`, `.callout` com `.warning`, `.success` ou `.risk`, `.tag`, `ol.steps` e `details`.
