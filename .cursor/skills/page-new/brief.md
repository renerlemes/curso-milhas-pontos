# Regras do curso

Texto de referência para escrever páginas. Siga na ordem e com as mesmas restrições.

## Objetivo

Desenvolver um curso educacional em português brasileiro chamado “Milhas & Pontos — Do zero à primeira passagem”.

O público é iniciante e quer aprender a acumular pontos, comprar pontos com bom custo, aproveitar bônus de transferência, pesquisar passagens com milhas e decidir quando uma operação realmente vale a pena.

O objetivo não é incentivar o acúmulo indiscriminado de pontos. O curso deve ensinar o aluno a tomar decisões financeiras conscientes, evitando compras desnecessárias, transferências precipitadas e promoções aparentemente vantajosas que não resultam em uma boa emissão.

O material será construído como páginas HTML navegáveis, não como slides de PowerPoint.

## Design system

Fonte visual: `docs/template-1.html`, já aplicado em `src/curso/styles.css`. Copie a casca de uma aula existente em `src/curso/content/`. Não recrie o CSS e não use `docs/template-2.html` (hero escuro, fórmula preta, menu em negrito).

Tokens em `:root`. Use as variáveis; não cole cor fixa na página.

- Texto: `--ink` `#0f172a`
- Texto secundário: `--muted` `#64748b`
- Azul: `--blue` `#2563eb`, fundo `--blue-soft` `#eff6ff`
- Página: `--page` `#f1f5f9`
- Cartão: `--soft` `#f8fafc`, borda `--line` `#e2e8f0`, raio `--radius` `12px`
- Verde: `--green` `#15803d`
- Âmbar: `--amber` `#c2410c`, fundo `--amber-soft` `#fff7ed`
- Vermelho: `--red` `#b91c1c`, fundo `--red-soft` `#fef2f2`

Aparência:

- Barra do topo branca, com a marca e uma linha inferior. Sem faixa azul-marinho.
- Cabeçalho da aula branco: selo do módulo (`.eyebrow`), título de 32px em peso 800, uma frase cinza (`.lead`) e o botão de concluir.
- Cartões cinza-claros. Aviso com borda colorida à esquerda, não caixa com ícone em quadrado.
- Fórmula em caixa clara.
- Menu lateral com módulos e aulas em peso 400. A aula atual ganha fundo azul-claro e faixa à esquerda, com cantos retos (`.lesson-link` tem `border-radius: 0`). Não arredonde o nome da aula.
- Pesos: 800 só no `h1`; 700 em `h2`, `h3` e números de etapa; 400 a 600 no resto.

Componentes disponíveis, só quando a aula precisar: selo do módulo, cartões, fórmula, tabela, caixas (informação, atenção, sucesso, risco), lista de etapas, exercício em `<details>` e rodapé com aula anterior e próxima. Não coloque a faixa de atalhos no topo da aula.

`docs/template-1.html` e `docs/template-2.html` têm textos e números de demonstração. Não os publique como conteúdo do curso.

## Arquitetura

- Cada aula é uma página HTML independente.
- Todas as páginas reutilizam o mesmo CSS e os mesmos componentes, por arquivos compartilhados.
- A navegação entre módulos e aulas funciona.
- Existe uma página inicial com a apresentação do curso e o índice dos módulos.
- O aluno identifica em qual módulo e aula está.
- Os caminhos dos links são relativos e funcionam localmente.
- As páginas funcionam em computador, tablet e celular.
- O conteúdo pode ser mantido sem editar estilos repetidos.
- Não introduza framework nem dependência além do que o repositório já tem (`serve`, que sobe com `yarn start`).

Estrutura:

- `index.html` na raiz, só para escolher curso ou slides
- `src/curso/index.html`
- `src/curso/styles.css`
- `src/curso/script.js`
- `src/curso/script-calculadoras.js` (só nas aulas de cálculo)
- `src/curso/content/modulos.json` (título e descrição dos módulos, e título de cada aula)
- `src/curso/content/` com as aulas: `src/curso/content/N-slug-do-modulo/N-slug-da-aula.html`
- `README.md` na primeira vez em que a casca for criada

Não há player de vídeo. Aula é HTML, não Markdown. `yarn start` gera o menu, observa `src/curso/content/` e sobe o servidor.

`docs/slides.pptx` é só referência de temas do minicurso antigo. Reescreva o conteúdo. Não copie frase, número, porcentagem ou regra do slide para a página.

O menu lateral do curso lista módulos e aulas (não o índice “nesta página” do template). Mantém progresso e o botão de marcar como concluída. Detalhe em [components.md](components.md).

## Estrutura didática

Use a sequência de [summary.md](summary.md). Você pode sugerir ajustes, mas explique a razão pedagógica antes de mudar a ordem geral dos módulos.

Não afirme que todos os programas são parceiros diretos entre si. A compatibilidade, a proporção e as condições devem ser verificadas para cada operação.

Fórmula de CPM:

CPM = (custo total considerado ÷ quantidade de pontos recebidos) × 1.000

Explique sempre quais custos foram incluídos e qual quantidade de pontos foi considerada. Não misture o CPM da compra com o custo por milheiro depois de um bônus sem deixar isso explícito.

Exemplo didático:

100.000 pontos adquiridos por R$ 1.500, transferidos na proporção 1:1 com bônus de 100%, resultam em 200.000 milhas, se a campanha permitir e todas as condições forem cumpridas. O custo efetivo é R$ 7,50 por milheiro, sem considerar eventuais custos adicionais.

Não apresente condições promocionais antigas como se estivessem vigentes. Sempre diferencie exemplos hipotéticos de ofertas atuais.

Diferencie claramente:

1. CPM de aquisição: quanto custaram os pontos.
2. Custo efetivo após bônus: custo por milheiro considerando a quantidade final recebida.
3. Valor da emissão: comparação entre a passagem em dinheiro e o custo total de emitir com milhas.

Uma compra com CPM baixo não garante que uma emissão específica seja vantajosa.

No módulo 6, use dados reais apenas quando puder verificá-los e informar a fonte e a data. Caso contrário, identifique claramente todos os valores como hipotéticos.

## Conteúdos complementares

Distribua nos módulos já mapeados, sem criar módulo extra:

- Validade dos pontos de acordo com origem, programa e regulamento vigente.
- Risco de expiração.
- Transferências que podem ser irreversíveis.
- Disponibilidade de assentos que pode mudar.
- Regras de bônus e requisitos de clubes.
- Taxas de emissão e custos adicionais.
- Custo de oportunidade do dinheiro.
- Risco de comprar pontos sem uma viagem ou resgate em vista.
- Como comparar passagens equivalentes.
- Como manter um registro de custo, saldo, validade e origem dos pontos.
- Checklist antes de participar de uma promoção.
- Glossário de termos: CPM, bônus, transferência, emissão, resgate, tabela fixa, tabela dinâmica, Avios, milheiro e outros termos utilizados.

## Padrão de cada página

Conforme a necessidade:

1. Módulo e identificação da aula.
2. Título específico.
3. Uma frase explicando o objetivo da aula.
4. Explicação didática com linguagem de iniciante.
5. Exemplos ou recursos visuais quando realmente ajudarem.
6. Fórmula ou tabela, quando relevante.
7. Caixa de atenção para erros comuns ou riscos.
8. Checklist prático, só quando a aula ensina uma conferência. Não crie seção de resumo.
9. Links e fontes, quando houver afirmações dependentes de regras vigentes.
10. Navegação para a aula anterior e a próxima aula. O índice fica no menu lateral e na página inicial.

Ensine um conceito de cada vez. Evite parágrafos longos, jargões sem explicação e páginas sobrecarregadas.

Não crie páginas com conteúdo superficial apenas para preencher a estrutura. Cada página precisa ter uma finalidade pedagógica clara.

## Escrita e precisão

- Escreva em português brasileiro.
- Use linguagem direta, acessível e profissional.
- Explique siglas na primeira ocorrência.
- Use exemplos numéricos passo a passo.
- Mostre as contas, não apenas o resultado.
- Identifique valores ilustrativos.
- Não trate faixas de CPM como regras universais: elas variam por programa, oferta e oportunidade de resgate.
- Não prometa economia garantida.
- Não recomende pagar juros ou assumir despesas artificiais só para ganhar pontos sem uma análise completa.
- Diferencie informações oficiais, exemplos hipotéticos e recomendações didáticas.
- Para regras que mudam frequentemente, consulte fontes oficiais atualizadas e informe a data de verificação.
- Não invente fontes, regulamentos, preços, promoções ou links.
- Se não for possível verificar uma informação, sinalize a limitação e deixe-a pendente de validação.

## Componentes e interação

Reutilize o design system para cartões de conceito, cartões de valores, fórmulas, tabelas comparativas, etapas numeradas, caixas de dica, atenção, sucesso e risco, glossário, exercícios com respostas explicadas, checklist, fontes e o indicador de progresso.

Se adicionar interatividade, ela deve funcionar de verdade. Não inclua botões decorativos que não executam nenhuma ação. Evite dependências externas desnecessárias.

A página deve ser acessível: contraste adequado, hierarquia semântica, navegação por teclado, textos alternativos para imagens e rótulos claros.

## Desenvolvimento

- Preserve o conteúdo útil que já existe.
- Não invente conteúdo para preencher lacunas sem sinalizar que precisa de pesquisa ou validação.
- Evite duplicação de CSS entre páginas.
- Mantenha nomes de arquivos e URLs consistentes.
- Teste links, navegação, responsividade e console de erros.
- Garanta que todas as páginas usem o mesmo cabeçalho, rodapé e componentes.
- Se alterar o template oficial, atualize o design system compartilhado em vez de corrigir páginas isoladamente.
- Não adicione imagens meramente decorativas se não melhorarem a compreensão.
- O README explica como executar, navegar e adicionar uma página nova.
