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
2. Buscar a tarifa em reais no Fli.
3. Calcular.
4. Responder só com o cartão HTML.

Não abra o site do programa nem o da companhia. Não confira disponibilidade de milhas no navegador. A resposta é o cartão e nada além dele.

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

Não consulte o site do programa nem o da companhia. As milhas e as taxas ficam como extraídas da imagem. A disponibilidade do prêmio não é verificada.

Data exata ausente: busque no Fli o mês indicado e não escolha um dia. Dois meses são duas consultas, não um par ida e volta, salvo se a imagem disser isso.

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

A tarifa em reais sai só do Fli, com BRL, pt-BR e país BR. Não confirme no site da companhia e não use outro comparador.

O Fli consulta tarifas em dinheiro no Google Flights. Ele não consulta milhas. Identifique o resultado como fonte secundária no aviso do cartão, com a data pesquisada, a companhia e as escalas. Se o MCP Fli não estiver carregado, rode o mesmo Fli pela linha de comando, com o `uv` e o pacote de `.cursor/mcp.json`: `uv tool run --from "flights @ git+https://github.com/punitarani/fli.git@<commit>" fli flights GRU CPT 2027-06-05 --airlines SA --currency BRL --language pt-BR --country BR --format json`. Consulte um dia de cada mês da imagem. Não abra o navegador.

Não compare tarifas diferentes sem informar a diferença. Considere bagagem, flexibilidade, escalas, duração do voo e condições tarifárias quando disponíveis.

Se não for possível obter a tarifa exata, apresente a limitação e não invente um preço. Passageiros não identificados não viram “1 passageiro” confirmado: diga que a quantidade não está na imagem e que a tarifa, se aparecer, precisa ser lida com essa ressalva.

## Cálculo

Execute o script a partir da pasta da skill, com Python 3. Neste Windows, `python` é só o atalho da Microsoft Store: use `C:\Users\Rener\.platformio\python3\python.exe`. Converta milhas para inteiro (`52900`) e dinheiro para `318.27` ou `318,27` antes de chamar. Se o interpretador não existir, diga isso na resposta. Não apresente conta manual como se fosse a saída do script.

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

Monte o cartão só depois de ter o preço em reais do Fli e a saída do script. As milhas e as taxas vêm da imagem. O custo do milheiro vem de [references/referencias-milheiro.md](references/referencias-milheiro.md): o preço-alvo vai no cartão e o topo da faixa vai nos avisos.

A resposta é só o cartão. Não escreva o relatório, o veredito nem o próximo passo fora do HTML.

Comece pelo cartão do resultado, em HTML, no layout de [assets/cartao-voo.html](assets/cartao-voo.html). O exemplo preenchido está em `docs/resultado-2.html` na raiz do projeto.

Mostre o cartão no chat como visualização HTML. Siga o ciclo de publicação da skill `visualize` (gravar o fragmento em `visualizations/` do store do agente e emitir a tag `cursor-content`). Copie o modelo, troque cada `{{CAMPO}}` e não mude o estilo. Sem store disponível, grave o arquivo em `docs/` e informe o caminho.

Cada itinerário é um `<section class="flight">`, nesta ordem:

1. Logo da companhia à esquerda do nome e, abaixo do nome, escalas e duração total. Logo do programa de pontos no canto superior direito. Sem número e sem preço no topo.
2. Cidades da origem, da escala e do destino, numa linha própria: `Goiânia → São Paulo → Curitiba`.
3. Horário de saída e de chegada, em 24 horas: `18:15` e `06:50`. Chegada no dia seguinte ganha `+1`.
4. Rota: código da origem, escala com o tempo de conexão e código do destino. Voo direto não ganha escala inventada: use a variante de voo direto do modelo, sem a bolinha do meio, a cidade da escala e o texto central.
5. Cabine, passageiros e, quando houver, tarifa, bagagem e se é só ida ou ida e volta.

Mostre até cinco itinerários, do menor preço ao maior, separados pela linha do próprio `.flight + .flight`. Se faltar horário, bagagem, tarifa ou conexão, escreva “não confirmado” nesse campo.

Cole a logo inline, copiando o SVG de `assets/logos/`. Não use endereço externo nem invente outra marca.

| Quem | Arquivo | No cartão |
|---|---|---|
| GOL | `companhias/gol.svg` | símbolo à esquerda do nome |
| LATAM | `companhias/latam.svg` | símbolo à esquerda do nome |
| Azul | `companhias/azul.svg` | símbolo à esquerda do nome |
| South African Airways | `companhias/saa.svg` | símbolo à esquerda do nome |
| Smiles | `programas/smiles.svg` | wordmark no lugar do nome |
| Livelo | `programas/livelo.svg` | wordmark no lugar do nome |
| LATAM Pass | `programas/latam-pass.svg` | símbolo e, ao lado, o nome |
| Azul Fidelidade | `programas/azul-fidelidade.svg` | símbolo e, ao lado, o nome |
| Esfera | `programas/esfera.svg` | símbolo e, ao lado, o nome |

Sem arquivo para aquela companhia ou programa, mostre só o nome.

Depois dos voos vem a comparação, uma vez, para o itinerário da emissão:

- Em dinheiro: preço em reais e, abaixo, de onde veio. Se a fonte estiver em outra moeda, converta pela cotação comercial do dia e escreva a taxa usada (`Estimativa a partir de US$ 414`). Esse valor é estimativa, não a tarifa cobrada no Brasil.
- Em pontos / milhas: custo total da emissão, milhas mais taxas e o custo do milheiro usado.
- Linha de economia: `≈ R$ 390 mais barato em milhas` ou `≈ R$ 120 mais caro em milhas`. Se a disponibilidade ou o preço em dinheiro não foram confirmados, use `≈ R$ 3.879 de diferença entre referências`. Sem preço em dinheiro, escreva “Economia não calculada”.
- Rodapé em duas colunas. À esquerda, mais larga, os avisos: se é estimativa, de onde veio cada preço, a cotação usada, a referência e a data do milheiro e o que falta confirmar. À direita, mais estreita, “Outras datas”: mês e ano em negrito e os dias abaixo, separados por `·`, para cada mês que a imagem ou a busca mostrar. Com uma data só, ou nenhuma, use `footer single` e tire a coluna da direita.

Todos os números da comparação saem do script. Campo sem dado fica “não confirmado”.

Não repita a comparação fora do cartão. O segundo cenário fica no aviso do rodapé.

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
