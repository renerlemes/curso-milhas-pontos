---
name: verificar-voo-milhas
description: >-
  Analisa imagens de ofertas de passagens aéreas com milhas ou pontos, confere
  se a oferta existe e segue disponível, compara o preço em dinheiro e calcula
  se a emissão vale a pena pelo custo do milheiro. Use quando o usuário enviar
  uma imagem, print ou anúncio de voo com milhas, pontos, taxas, Smiles, LATAM
  Pass, Azul Fidelidade, Livelo, Esfera, Iberia, Avios ou pedir para verificar
  se uma emissão vale a pena.
---

# Verificar oferta de voo com milhas

A oferta da imagem é uma hipótese. Disponibilidade, tarifa em dinheiro e custo do milheiro só entram na conclusão com fonte, horário e status. Dado ausente fica como não identificado ou não confirmado.

Leia [references/fontes-confiaveis.md](references/fontes-confiaveis.md) antes de buscar. Leia [references/referencias-milheiro.md](references/referencias-milheiro.md) antes de escolher o custo do milheiro. Rode o cálculo em `scripts/calcular-emissao.py`. Não refaça a conta à mão.

## Fluxo

1. Extrair a imagem.
2. Verificar a oferta no programa da emissão.
3. Buscar a tarifa em dinheiro da mesma viagem.
4. Calcular.
5. Responder no formato fixo.

## Extrair a imagem

Não invente o que a imagem não mostra. Cada campo recebe um status:

- confirmado: o usuário afirmou o dado fora da imagem
- extraído da imagem
- não identificado

Extraia, quando aparecerem:

- Aeroporto de origem e destino, preferencialmente códigos IATA
- Companhia aérea operadora
- Companhia ou programa em que o resgate é feito
- Cabine: econômica, premium economy, executiva ou primeira classe
- Data ou intervalo de datas disponíveis
- Milhas/pontos exigidos por trecho
- Taxas aeroportuárias e demais valores em dinheiro
- Se o preço é por trecho ou ida e volta
- Quantidade de passageiros, se indicada
- Restrições de assinatura, categoria elite ou clube
- Data da publicação ou da consulta
- Site de origem da oferta

Se a imagem apresentar um intervalo de milhas, mantenha o mínimo e o máximo separados. Não use a média. Não transforme preço por trecho em ida e volta, nem o contrário. Se a imagem não disser o escopo, o escopo fica não identificado e os números não são dobrados nem somados a um trecho invisível.

Separe quem opera o voo de quem emite o prêmio. Preço em AAdvantage não confirma preço Smiles do mesmo avião.

## Verificar a oferta

Siga esta ordem:

1. Buscar disponibilidade para a rota e a data exata.
2. Confirmar se a cabine e a companhia correspondem à imagem.
3. Conferir milhas exigidas, taxas e restrições.
4. Registrar a fonte, o horário da consulta e a URL.
5. Se não for possível confirmar, declarar explicitamente que a disponibilidade não foi verificada.

Data exata ausente: busque o mês indicado e não escolha um dia. Dois meses são duas consultas, não um par ida e volta, salvo se a imagem disser isso.

Não há MCP de disponibilidade de milhas configurado. Confira o prêmio no site oficial do programa da emissão. Preço de outro programa, inclusive AAdvantage, não confirma o preço Smiles do mesmo avião.

Use o navegador integrado só em página pública do programa ou da companhia. Pare em login, CAPTCHA ou bloqueio. Não crie conta e não peça senha. Uma página aberta não é reserva garantida.

Diferencie:

- Oferta encontrada e disponibilidade confirmada
- Oferta publicada por uma fonte secundária, ainda não confirmada no programa
- Oferta não encontrada na busca
- Consulta indisponível ou inconclusiva

Não conclua que a oferta é falsa apenas porque a busca não encontrou resultados. Assentos-prêmio podem ter disponibilidade limitada, e alguns sites exigem autenticação.

Mapeie para o status da resposta:

- confirmado: encontrada no programa da emissão, com cabine, milhas e taxas conferidas
- parcialmente confirmado: fonte secundária, ou só parte dos campos bateu
- não encontrado: a busca no programa cobriu a rota e a data e não mostrou a oferta
- inconclusivo: a consulta não pôde ser feita ou não cobriu o que a imagem afirma

## Comparação com a tarifa em dinheiro

Busque o preço em dinheiro para a mesma rota, datas, cabine e quantidade de passageiros.

Priorize:

1. MCP Fli (`search_flights` para data exata ou `search_dates` para intervalo), com BRL, pt-BR e país BR.
2. Site oficial da companhia aérea para confirmar o preço encontrado.
3. Outro comparador confiável, quando necessário.

O Fli consulta tarifas em dinheiro no Google Flights. Ele não consulta milhas nem confirma disponibilidade Smiles. Identifique seu resultado como fonte secundária e registre a data pesquisada, companhia, escalas e URL ou ferramenta. Se o MCP Fli não estiver carregado após editar `.cursor/mcp.json`, peça para recarregar a janela do Cursor e não volte à automação lenta do navegador para dezenas de datas.

Não compare tarifas diferentes sem informar a diferença. Considere bagagem, flexibilidade, escalas, duração do voo e condições tarifárias quando disponíveis.

Se não for possível obter a tarifa exata, apresente a limitação e não invente um preço. Passageiros não identificados não viram “1 passageiro” confirmado: diga que a quantidade não está na imagem e que a tarifa, se aparecer, precisa ser lida com essa ressalva.

## Cálculo

Execute o script a partir da pasta da skill, com Python 3 (`python` ou, no Windows, `py -3`). Converta milhas para inteiro (`52900`) e dinheiro para `318.27` ou `318,27` antes de chamar. Se o interpretador não existir, diga isso na resposta. Não apresente conta manual como se fosse a saída do script.

```bash
python scripts/calcular-emissao.py --milhas 52900 --milhas-max 57700 --taxas 318.27 --cenario preco-alvo=16 --cenario faixa-alta=18
```

Com preço em dinheiro confirmado, acrescente `--preco-dinheiro 2500.00`. Sem esse argumento, o script deixa economia e valor obtido vazios. Não preencha o vazio.

Fórmulas, aplicadas pelo script:

Custo equivalente das milhas = (milhas utilizadas / 1.000) × custo de aquisição do milheiro.

Custo total da emissão com milhas = custo equivalente das milhas + taxas e encargos pagos em dinheiro.

Economia estimada = preço da passagem em dinheiro − custo total da emissão com milhas.

Percentual de economia = economia estimada / preço da passagem em dinheiro × 100.

Valor obtido por milheiro na emissão = (preço em dinheiro − taxas da emissão com milhas) / (milhas utilizadas / 1.000).

Apresente os resultados em reais, com duas casas decimais.

Se o usuário não informar o custo de aquisição, calcule os cenários padrão do programa em [references/referencias-milheiro.md](references/referencias-milheiro.md). Identifique claramente cada cenário como estimativa. Não confunda o custo de aquisição do milheiro com o valor que ele proporciona em uma emissão. Ida e volta com números diferentes: rode o script por trecho e some só os totais já calculados.

## Regras de avaliação

A conclusão deve considerar:

- Custo de aquisição dos pontos
- Valor de mercado do milheiro
- Preço da passagem em dinheiro
- Taxas e encargos
- Disponibilidade real
- Validade dos pontos e do bônus
- Custo de oportunidade de manter os pontos
- Restrições de clubes ou categorias
- Possibilidade de encontrar tarifas melhores

Não considere uma transferência com bônus automaticamente vantajosa.

Não recomende comprar ou transferir pontos apenas porque existe uma promoção. Se possível, confirme primeiro a disponibilidade do assento desejado.

Se houver diferenças relevantes entre ida e volta, analise cada trecho separadamente e também o total da viagem.

Veredito `Vale a pena` exige disponibilidade confirmada no programa, tarifa em dinheiro comparável e custo de aquisição informado ou, na falta dele, todos os cenários estimados ainda folgados. Se a disponibilidade não foi verificada, o máximo é `Pode valer a pena, dependendo das condições` ou `Dados insuficientes para concluir`. Sem preço em dinheiro, sem milhas ou sem taxas, use `Dados insuficientes para concluir`.

## Formato da resposta

Comece pelo cartão do resultado, em HTML, no layout de [assets/cartao-voo.html](assets/cartao-voo.html). O exemplo preenchido está em `docs/resultado-2.html` na raiz do projeto.

Mostre o cartão no chat como visualização HTML. Siga o ciclo de publicação da skill `visualize` (gravar o fragmento em `visualizations/` do store do agente e emitir a tag `cursor-content`). Copie o modelo, troque cada `{{CAMPO}}` e não mude o estilo. Sem store disponível, grave o arquivo em `docs/` e informe o caminho.

Cada itinerário é um `<section class="flight">`, nesta ordem:

1. Número e companhia. Abaixo do nome: escalas e duração total. Sem preço no topo.
2. Cidades da origem, da escala e do destino, numa linha própria: `Goiânia → São Paulo → Curitiba`.
3. Horário de saída e de chegada, com AM/PM: `6:10 AM` e `10:20 AM`.
4. Rota: código da origem, escala com o tempo de conexão e código do destino. Voo direto não ganha escala inventada: tire a bolinha do meio, a cidade da escala e o texto central.
5. Tarifa, bagagem e se é só ida ou ida e volta.

Mostre até cinco itinerários, do menor preço ao maior, separados pela linha do próprio `.flight + .flight`. Não desenhe logo de companhia. Se faltar horário, bagagem, tarifa ou conexão, escreva “não confirmado” nesse campo.

Depois dos voos vem a comparação, uma vez, para o itinerário da emissão:

- Em dinheiro: preço em reais e, abaixo, de onde veio. Se a fonte estiver em outra moeda, converta pela cotação comercial do dia e escreva a taxa usada (`Estimativa a partir de US$ 414`). Esse valor é estimativa, não a tarifa cobrada no Brasil.
- Em pontos / milhas: custo total da emissão, milhas mais taxas e o custo do milheiro usado.
- Linha de economia: `≈ R$ 390 mais barato em milhas` ou `≈ R$ 120 mais caro em milhas`. Sem preço em dinheiro, escreva “Economia não calculada”.
- Avisos: se é estimativa, a referência e a data do milheiro e se o preço em dinheiro foi confirmado na companhia.

Todos os números da comparação saem do script. Campo sem dado fica “não confirmado”.

Depois do cartão, use o relatório abaixo. Com intervalo de milhas ou mais de um cenário, repita a tabela, uma por limite e por cenário. Não colapse mínimo e máximo numa linha só.

### Resultado da verificação

- Status: confirmado, parcialmente confirmado, não encontrado ou inconclusivo.
- Data e horário da consulta.
- Fonte consultada e link direto.

### Dados extraídos da imagem

- Origem → destino.
- Companhia aérea e programa.
- Cabine.
- Datas.
- Milhas por trecho.
- Taxas em dinheiro.
- Restrições relevantes.
- Escopo do preço: por trecho, ida e volta ou não identificado.
- Passageiros, data da publicação e site de origem, cada um com o status do dado.

### Comparação de preços

| Item | Valor |
|---|---:|
| Preço da passagem em dinheiro | R$ |
| Milhas exigidas | X |
| Custo equivalente das milhas | R$ |
| Taxas da emissão | R$ |
| Custo total estimado | R$ |
| Economia estimada | R$ |
| Economia percentual | % |
| Valor obtido por milheiro | R$ |

Quando faltarem dados, indique “não confirmado” em vez de preencher com suposições.

Nomeie o cenário acima da tabela: informado ou estimativa, com o custo do milheiro usado.

### Veredito

Escolha uma conclusão:

- Vale a pena.
- Pode valer a pena, dependendo das condições.
- Não vale a pena.
- Dados insuficientes para concluir.

Explique em no máximo cinco frases o motivo da conclusão.

### Próximo passo

Indique o link oficial onde o usuário pode confirmar ou emitir a passagem. O link é o do programa da emissão. Se a consulta parou em login, diga isso.

## Caso de referência

`examples/oferta-gru-mia.png` traz GRU → MIA, American Airlines, Smiles, econômica, 52.900 a 57.700 milhas, R$ 318,27 e os meses de novembro de 2026 e fevereiro de 2027. Não informa dia, escopo, passageiros, preço em dinheiro nem custo do milheiro. Não dobre as milhas e não declare essa oferta disponível só com a imagem.
