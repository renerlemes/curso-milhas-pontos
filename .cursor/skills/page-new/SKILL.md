---
name: page-new
description: >-
  Cria e revisa aulas HTML do curso Milhas & Pontos e o slide do mesmo assunto em src/slides. Use ao criar, adicionar ou revisar uma página, aula, módulo, a página inicial do curso, um slide ou uma calculadora. A mesma mudança entra no curso e no slide. Calculadora ou valor de referência do milheiro entra também em src/calculadora. Deixe curso, slide ou calculadora de fora só se o usuário pedir.
---

# Nova página do curso

Cria ou revisa a aula pedida. Não recrie o curso inteiro.

Mapa: [summary.md](summary.md). Casca: [components.md](components.md). Escrita: [brief.md](brief.md).

## Passos

1. Encaixe no mapa. Sem título do usuário, use o de `src/curso/content/modulos.json`. Não mude a ordem dos módulos; se precisar sugerir mudança, explique a razão pedagógica e espere confirmação.
2. A casca já existe. Não a recrie. Copie uma aula do mesmo módulo em `src/curso/content/`.
3. Edite essa aula e a mesma mudança no slide do módulo em `src/slides/content/` (um HTML por módulo). Confira `data-lesson="m<módulo>-a<aula>"` com os números da pasta e do arquivo. Aula ou módulo novo entra em `src/curso/content/modulos.json`. Título de módulo novo ou renomeado entra também em `src/slides/content/modulos.json`.
4. Escreva o texto de novo. Siga [brief.md](brief.md).
5. Confira a conta, os links relativos e o botão de concluir.
6. Com `yarn start` na raiz, abra a aula e o slide, marque e desmarque como concluída e olhe a largura de celular. Se mexeu em calculadora ou no milheiro de referência, abra também `/calculadora/`. Se não der para abrir o browser, diga isso.

## Curso, slides e calculadoras

A mesma mudança entra no curso e no slide do módulo. Os slides `0-abertura.html` e `8-encerramento.html` não têm aula no curso.

Calculadora (formulário, conta, rótulo ou texto) ou valor de referência do milheiro também entra em `src/calculadora/index.html`.

A referência do milheiro está na aula 3.4, na aula 7.1, nos slides dos módulos 3 e 7, na tabela de `src/calculadora/index.html` e no `data-reference` da emissão (aula 7.4, slide do módulo 7 e a página de calculadoras).

A conta está em `src/curso/script-calculadoras.js`. O slide usa a cópia `src/slides/script-calculadoras.js`. A página de calculadoras usa o script do curso. Se a conta mudar, atualize os dois scripts.

Deixe curso, slide ou calculadora de fora só se o usuário pedir para alterar só uma dessas partes.

## Arquivo

Padrão `N-slug`: número sem zero à esquerda, hífen, minúsculas, sem acento. Espaço e pontuação viram hífen. Sem `/ \ : * ? " < > |`.

```
src/curso/content/1-fundamentos-e-estrategia/1-introducao-aos-pontos-e-milhas.html
```

- Título do menu, do `<h1>` e do `<title>`: o de `modulos.json`.
- Links de CSS, JS e páginas são relativos. Não use caminho que comece com `/` nas aulas.
- Renumerar muda o id (`m1-a2`) e apaga o visto de concluída de quem já marcou; avise antes. Trocar só o slug mantém o id.
- Selo: `Módulo N - Aula N`. Sem selo de nível.
- Se o objetivo da aula mudar, atualize a linha em [summary.md](summary.md).

## Tamanho

Referência: `src/curso/content/1-fundamentos-e-estrategia/1-introducao-aos-pontos-e-milhas.html`.

- Frases curtas. Um termo técnico se explica na hora, numa frase.
- Uma ideia por seção. Em geral, até três seções curtas.
- Até dois cartões ou uma tabela pequena por seção, e só se ajudarem.
- Sem seção de resumo nem “O que levar desta aula”.
