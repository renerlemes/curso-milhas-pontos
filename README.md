# Milhas & Pontos — Do zero à primeira passagem

Curso em páginas HTML estáticas, sem framework.

## Executar

Na raiz do projeto:

```bash
yarn install
yarn start
```

Abra http://localhost:3000. Se a porta estiver ocupada, o terminal mostra o endereço usado.

O menu do curso é montado no navegador a partir das pastas de `src/curso/content/`, que o `serve` lista para a página. Não há build: ao criar, renomear ou apagar uma aula, basta atualizar a página (F5).

O curso precisa do `yarn start` rodando. Aberto direto do disco ou publicado em hospedagem estática, o menu não carrega.

## Estrutura

```
index.html                      Escolha entre curso e slides
src/curso/index.html                Página inicial e índice dos módulos
src/curso/styles.css                Design system (visual de docs/template-1.html)
src/curso/script.js                 Lê src/curso/content/ e monta menu, progresso, concluir e navegação
src/curso/script-calculadoras.js    Calculadoras das aulas do módulo de cálculos
src/curso/content/modulos.json      Título e descrição de cada módulo, e título de cada aula
src/curso/content/N-modulo/N-aula.html
src/slides/content/modulos.json     Título original de cada parte dos slides
src/slides/content/N-parte.html     Apresentação de slides
docs/                           Referências: template visual, resumo, slides antigos
```

## Navegação e progresso

- O menu lateral lista os módulos e as aulas, na ordem dos números das pastas e dos arquivos.
- O botão **Marcar como concluída** fica no final de cada aula. O progresso é salvo no `localStorage` do navegador, na chave `mp-course-progress`. Limpar os dados do navegador ou trocar de aparelho zera o progresso.
- O rodapé de cada aula tem aula anterior e próxima aula. O índice fica no menu lateral e na página inicial.

## Adicionar uma aula

1. Crie o arquivo em `src/curso/content/N-slug-do-modulo/N-slug-da-aula.html`, copiando uma aula existente do mesmo módulo. Número sem zero à esquerda; slug em minúsculas, sem acento, com hífen no lugar de espaço.
2. No `<body>`, ajuste `data-lesson` para `m<módulo>-a<aula>` (ex.: `m2-a1`). Mantenha `data-root="../../"`.
3. Ajuste `<title>`, o módulo no `.eyebrow`, o `<h1>`, a frase do `.lead` e o número da aula no `.pill`.
4. Acrescente a aula em `src/curso/content/modulos.json`, no módulo certo, com o mesmo número do arquivo e o título original (com acento e maiúsculas). O menu lê esse título, não o nome do arquivo.
5. Módulo novo: crie a pasta `N-slug-do-modulo` e acrescente número, título, descrição e a lista de aulas em `modulos.json`.

Arquivos ou pastas fora do padrão `N-slug` ficam fora do menu. Se o `data-lesson` não bater com os números da pasta e do arquivo, o botão de concluir e o destaque no menu não funcionam nessa aula.

Renumerar uma aula muda o id dela (`m1-a2` vira `m1-a3`, por exemplo). Quem já tinha marcado essa aula como concluída perde o visto dela.

O projeto também tem a skill `.cursor/skills/page-new`, que segue estas regras para criar páginas novas.
