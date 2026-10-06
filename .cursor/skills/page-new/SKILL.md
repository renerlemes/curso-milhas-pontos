---
name: page-new
description: >-
  Cria páginas HTML do curso Milhas & Pontos — Do zero à primeira passagem, no visual limpo de docs/template-1.html (CSS compartilhado em src/curso/styles.css), com menu de módulos, progresso e botão de marcar como concluída. Use ao criar, adicionar ou revisar uma página, aula, módulo ou a página inicial do curso.
---

# Nova página do curso

Cria a página pedida. Não recrie o curso inteiro se o pedido foi uma aula.

Leia [brief.md](brief.md) e siga aquelas regras. Mapa de aulas: [summary.md](summary.md). Casca, menu, progresso e componentes: [components.md](components.md).

## Passos

1. Encaixe o pedido no mapa. Sem título dado pelo usuário, use o título do mapa. Não mude a ordem dos módulos; se precisar sugerir mudança, explique a razão pedagógica e espere confirmação.
2. A casca já existe (`src/curso/index.html`, `src/curso/styles.css`, `src/curso/script.js`). Não a recrie. Se `src/curso/content/` tiver arquivos do player antigo (`.md`, vídeo, legenda), avise o usuário antes de mexer.
3. Crie ou edite só o HTML da aula pedida em `src/curso/content/`, no padrão de nome abaixo. O menu lê as pastas direto pelo servidor; não há build para rodar. Confira se o `data-lesson` bate com os números da pasta e do arquivo. Módulo novo também entra em `src/curso/content/modulos.json` com número, título, descrição e a lista de aulas. O título de cada aula nova entra nessa lista, com o mesmo número do arquivo.
4. Reescreva o texto. `docs/slides.pptx` e os textos e números de `docs/template-1.html` e `docs/template-2.html` não são o conteúdo da página.
5. Confira a conta no papel, os links relativos e o botão de concluir.
6. Com o servidor já no ar, abra a página, marque e desmarque como concluída e olhe a largura de celular. Se o servidor não estiver no ar, suba com `yarn start` na raiz do projeto. Se não der para abrir o browser, diga isso.

## Tamanho e linguagem

Use como referência a aula `src/curso/content/1-fundamentos-e-estrategia/1-introducao-aos-pontos-e-milhas.html`:

- Frases curtas, palavras do dia a dia, sem jargão. Explique um termo técnico na hora, numa frase.
- Uma ideia por seção. Em geral, até três seções curtas.
- Até dois cartões ou uma tabela pequena por seção, e só se ajudarem a entender.
- Não crie seção de resumo nem “O que levar desta aula”.
- Ao revisar uma aula, atualize também a linha dela em `docs/resumo.md` e em [summary.md](summary.md).

## Arquivo da aula

Todo o conteúdo do curso fica em `src/curso/content/`. Pasta de módulo e arquivo de aula seguem o padrão `N-slug`: número sem zero à esquerda, hífen e o nome em minúsculas, sem acento. Espaço e pontuação viram hífen.

```
src/curso/content/1-fundamentos-e-estrategia/1-introducao-aos-pontos-e-milhas.html
src/curso/content/1-fundamentos-e-estrategia/2-acumular-transferir-e-resgatar.html
src/curso/content/2-conhecer-os-programas-e-suas-regras/1-livelo-e-esfera.html
```

- O número da pasta é o número do módulo no mapa; o do arquivo, o número da aula dentro do módulo. A ordem do menu segue esses números.
- O título do menu vem de `src/curso/content/modulos.json`: `titulo` do módulo e `aulas[].titulo` da aula, com acento e maiúsculas. Use o mesmo texto da aula no `<h1>` e no `<title>`. Aula nova entra nessa lista com o mesmo número do arquivo.
- Não use `/ \ : * ? " < > |` nem acento ou espaço no nome do arquivo.
- Renumerar exige ajustar o `data-lesson` da página. Renumerar muda o id e apaga o visto de concluída daquela aula para quem já tinha marcado; avise o usuário antes. Trocar só o slug, sem mudar o número, mantém o id.

`src/curso/index.html` é a página inicial do curso. `src/curso/styles.css` e `src/curso/script.js` ficam ao lado dela. Nenhuma aula fica fora de `src/curso/content/`. A raiz do site só escolhe entre curso e slides.

Id: `m<N>-a<N>` (ex.: `m1-a2`), calculado pelos números da pasta e do arquivo. O `data-lesson` do `<body>` precisa ser igual; o gerador avisa quando não é.

Links de CSS, JS e outras páginas são relativos ao arquivo, para abrir no disco e pelo `yarn start`. Não use caminho que comece com `/`.

Visual: copie uma aula de `src/curso/content/` e o CSS de `src/curso/styles.css`. Esse arquivo já aplica `docs/template-1.html`. Não volte ao hero escuro de `docs/template-2.html` e não ponha `border-radius` no link da aula no menu. Não coloque selo de nível (“Nível iniciante” ou equivalente) em nenhuma página. O selo da aula usa o formato `Módulo N - Aula N`, por exemplo `Módulo 1 - Aula 2`.
