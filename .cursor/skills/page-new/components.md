# Casca, menu e componentes

O menu do curso fica na coluna esquerda. Não coloque a lista de atalhos no início da aula (`.page-toc`, com rótulos como “Resumo” ou “Exemplo”).

Progresso e concluir fazem parte de toda aula:

- Chave `localStorage`: `mp-course-progress` (array de ids).
- Rodapé do menu: “Progresso”, `feitas / total`, barra e “N% concluído”.
- Botão no final do conteúdo, depois de `.body` e antes do rodapé: “Marcar como concluída” / “Marcar como não concluída”. Nunca coloque esse botão no cabeçalho.
- Aula concluída mostra visto no menu. A barra atualiza sem recarregar. Recarregar mantém o estado.
- Total = aulas encontradas em `src/curso/content/`. Feitas = ids salvos que ainda existem nessa lista.

## Dados e script

Não há build. O `src/curso/script.js` pede ao `serve` a listagem de `src/curso/content/` e de cada pasta de módulo (`fetch` com `Accept: application/json`) e lê `src/curso/content/modulos.json` (título e descrição de cada módulo, inclusive os ainda sem aula, e o título de cada aula). Por isso o curso só funciona com `yarn start` rodando; aberto do disco, o menu mostra um aviso.

Pastas e arquivos fora do padrão `N-slug` ficam fora do menu. O id da aula sai dos números: `m<módulo>-a<aula>`. O título exibido sai do JSON, não do nome do arquivo. A estrutura montada é esta:

```javascript
{
  modules: [
    {
      id: "m1",
      title: "Fundamentos e Estratégia",
      lessons: [
        {
          id: "m1-a1",
          title: "Como Funcionam os Programas de Fidelidade",
          href: "content/1-fundamentos-e-estrategia/1-introducao-aos-pontos-e-milhas.html"
        }
      ]
    }
  ]
}
```

`href` é o caminho real do arquivo, relativo a `src/curso/`, no slug da pasta e da aula. O `src/curso/script.js` monta o link com `encodeURI(root + href)`.

`src/curso/script.js`:

1. Lê `document.body.dataset.root` (vazio na home, `../../` numa aula em `src/curso/content/N-modulo/`).
2. Monta `#curriculum`: botão por módulo (`aria-expanded`) e link por aula, com o número da aula antes do título (1, 2, 3… dentro do módulo). O módulo da aula atual começa aberto. Módulo fechado esconde a lista.
3. O link do `data-lesson` recebe `.active`.
4. Ids salvos recebem `.completed` e um visto.
5. Atualiza `#progress-count`, `#progress-fill`, `#progress-pct` e `aria-valuenow`.
6. `#btn-toggle-complete` alterna o id, grava e atualiza botão, visto e barra. Sem `data-lesson`, o botão não aparece.
7. `#lesson-pager` recebe só a aula anterior e a próxima, com o prefixo `data-root`. Na primeira ou na última, omita o lado inexistente. Não coloque botão de índice do módulo.

`src/curso/index.html` usa a mesma casca, sem `data-lesson`. O miolo apresenta o curso. A lista de módulos sai do script, não de uma segunda cópia manual.

## CSS

O CSS já existe em `src/curso/styles.css`, no visual limpo de `docs/template-1.html`. Use as classes dele e não espalhe `<style>` nas aulas. Mudança de visual se faz nesse arquivo, para todas as páginas.

O padrão:

- Cabeçalho da aula branco, com o módulo num selo azul claro, título de cerca de 32px e frase de objetivo em cinza.
- Cartões em fundo cinza-claro com borda fina; avisos (`.callout`) com borda colorida à esquerda.
- Fórmula em caixa clara, não em bloco escuro.
- Menu do curso (`.course-nav`) com módulos e aulas em peso 400. A aula atual ganha fundo `--blue-soft` e faixa azul à esquerda, com `border-radius: 0`. Não arredonde o nome da aula.
- Pesos de fonte: 800 só no `<h1>`; 700 em `h2`, `h3`, números e fórmula; 400 a 600 no resto.

## Esqueleto

Numa aula dentro de `src/curso/content/N-modulo/`, o prefixo dos arquivos compartilhados é `../../`. Na home do curso, é vazio e `data-root` fica vazio.

```html
<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
  <meta http-equiv="Pragma" content="no-cache">
  <meta http-equiv="Expires" content="0">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#ffffff">
  <title>Título da aula — Milhas &amp; Pontos</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../../styles.css">
</head>
<body data-lesson="m1-a1" data-root="../../">
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <header class="topbar">
    <div class="topbar-inner">
      <a class="brand" href="../../index.html">
        <div class="brand-mark">M&amp;P</div>
        <div>Milhas &amp; Pontos<small>Guia prático de viagens</small></div>
      </a>
      <div class="top-note">Do zero à primeira passagem</div>
    </div>
  </header>
  <div class="layout">
    <aside class="course-nav" aria-label="Módulos e aulas">
      <div class="course-nav-label"><a href="../../index.html">Aulas</a></div>
      <nav id="curriculum" aria-label="Módulos do curso"></nav>
      <footer class="course-progress">
        <div class="progress-label"><span>Progresso</span><span id="progress-count">0 / 0</span></div>
        <div class="progress-bar" id="progress-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress-fill" id="progress-fill"></div>
        </div>
        <div class="progress-pct" id="progress-pct">0% concluído</div>
      </footer>
    </aside>
    <main id="conteudo">
      <article class="lesson">
        <header class="hero">
          <div class="eyebrow">Módulo 1 · Fundamentos e Estratégia</div>
          <h1>Título da aula</h1>
          <p class="lead">Uma frase com o objetivo da aula.</p>
          <div class="meta">
            <span class="pill">Módulo 1 - Aula 1</span>
          </div>
        </header>
        <div class="body"></div>
        <div class="lesson-actions">
          <button type="button" class="btn" id="btn-toggle-complete">Marcar como concluída</button>
        </div>
        <footer class="footer">
          <nav class="actions" id="lesson-pager" aria-label="Navegação entre aulas"></nav>
        </footer>
      </article>
    </main>
  </div>
  <script src="../../script.js"></script>
</body>
</html>
```

## Miolo

Seção:

```html
<section class="section" id="conceito">
  <div class="kicker">01 · Conceito</div>
  <h2>Título da seção</h2>
  <p>Explicação curta.</p>
</section>
```

Cartões:

```html
<div class="grid2">
  <div class="card soft">
    <div class="card-label">O que observar</div>
    <h3>Título</h3>
    <p class="muted">Texto.</p>
  </div>
</div>
```

Valores de uma conta:

```html
<div class="grid3">
  <div class="card">
    <div class="card-label">Valor pago</div>
    <div class="metric">R$ …</div>
    <p class="muted">O que entrou neste número.</p>
  </div>
</div>
```

Fórmula:

```html
<div class="formula">
  <div class="formula-label">Custo por milheiro (CPM)</div>
  <div class="equation">(custo total considerado ÷ quantidade de pontos recebidos) × 1.000</div>
</div>
```

Caixas: informação sem classe extra (`i`), atenção (`.warning`, `!`), resultado (`.success`, `✓`), risco (`.risk`, `!`).

```html
<div class="callout warning">
  <div class="callout-icon">!</div>
  <div>
    <strong>Atenção</strong>
    <p>Erro comum ou risco.</p>
  </div>
</div>
```

Exemplo:

```html
<div class="card">
  <span class="tag">Exemplo ilustrativo</span>
  <h3>Título</h3>
  <p>Valores hipotéticos. Não são oferta vigente.</p>
</div>
```

Checklist:

```html
<ol class="steps">
  <li><strong>Passo:</strong> o que conferir.</li>
</ol>
```

Exercício, só quando a aula treina uma conta ou uma decisão:

```html
<details>
  <summary>Conferir a conta</summary>
  <p>Mostre a conta e o que ela não prova.</p>
</details>
```

Pendente:

```html
<p><strong>Pendente de validação:</strong> esta regra muda. Confira no site oficial do programa antes de operar. Sem fonte conferida nesta página.</p>
```
