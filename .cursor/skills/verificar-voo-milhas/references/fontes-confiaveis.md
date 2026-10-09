# Fontes para verificar a oferta e o preço em dinheiro

Consultado em 9 de outubro de 2026. Não use esta página como prova de que um voo está disponível.

## O que existe e o que não existe aqui

Não há MCP de disponibilidade de milhas configurado. O Fli busca tarifas em dinheiro no Google Flights, mas não consulta pontos, milhas, Smiles nem confirma emissão-prêmio. AwardFares, seats.aero e a API Amadeus não estão configurados: o primeiro e o segundo exigem conta, e a Amadeus exige chave. Não contorne login, CAPTCHA nem bloqueio de acesso.

## Fli — tarifas em dinheiro

Repositório e documentação: [punitarani/fli](https://github.com/punitarani/fli). O projeto usa a página pública de pesquisa do Google Flights e lê os dados estruturados embutidos nela. Não é uma API oficial do Google e pode parar de funcionar quando o Google mudar o formato.

O servidor local está configurado em `.cursor/mcp.json` por STDIO, executado com `uv`. Não usa token. Ferramentas:

| Ferramenta | Uso nesta skill |
|---|---|
| `search_flights` | Tarifa em dinheiro para uma data exata |
| `search_dates` | Menores tarifas num intervalo de até 93 dias |

Na consulta brasileira, envie `currency: BRL`, `language: pt-BR` e `country: BR`. Use `airlines: ["AA"]` quando a imagem exigir American Airlines, cabine `ECONOMY` e `passengers: 1` somente quando a imagem ou o usuário confirmar um passageiro. Se a quantidade não estiver indicada, uma busca com um adulto é apenas referência e precisa dessa ressalva.

Limitações relevantes da versão 0.10.0 consultada em 9 de outubro de 2026:

- Só tarifa em dinheiro; não confirma disponibilidade Smiles.
- `search_dates` faz uma requisição por dia e aceita no máximo 93 dias. Evite varrer meses inteiros quando a imagem já lista dias.
- Resultados são cerca de 20–45 itinerários e podem ser incompletos.
- Filtros de bagagem, tarifa econômica básica e emissões não são suportados.
- Opções finais de reserva não estão disponíveis; o link profundo é montado localmente.
- Uma busca vazia não prova que não há voo, especialmente com crianças ou bebês.
- O Google pode devolver página sem dados, consentimento ou bloqueio. Nesse caso, marque a tarifa como não confirmada.
- O projeto é MIT e gratuito; não há plano pago ou cota comercial publicada. Há rate limiting, retries e custo de rede local.

Para a imagem GRU–MIA, os dias publicados são 05, 06, 09, 11 e 12/11/2026; e 09, 10, 15–28/02/2027. Consulte primeiro um dia de cada faixa. Se o resultado divergir muito, consulte os demais dias, respeitando o volume de requisições.

## Sites oficiais dos programas

Use o navegador integrado do Cursor em página pública. Pare diante de login, CAPTCHA ou bloqueio. Registrar a URL e o horário não equivale a reserva.

| Programa da emissão | Onde confirmar o prêmio | Tarifa em dinheiro da operadora |
|---|---|---|
| Smiles | [smiles.com.br](https://www.smiles.com.br/) | Site da companhia que opera o voo. GOL: [voegol.com.br](https://www.voegol.com.br/) |
| LATAM Pass | [latampass.latam.com/pt_br](https://latampass.latam.com/pt_br/) | [latamairlines.com/br/pt](https://www.latamairlines.com/br/pt) |
| Azul Fidelidade | [voeazul.com.br](https://www.voeazul.com.br/br/pt/programa-fidelidade) | [voeazul.com.br](https://www.voeazul.com.br/) |
| Iberia Club / Avios | [iberia.com/br](https://www.iberia.com/br/) | [iberia.com](https://www.iberia.com/) ou o site de quem opera |
| American, quando o resgate for AAdvantage | [aa.com](https://www.aa.com/) | [aa.com](https://www.aa.com/) |

A busca de prêmio da Smiles, da LATAM e da Azul pode pedir conta no resultado. Se a página pedir login, pare e marque a consulta como inconclusiva. Não crie conta, não peça senha e não tente seguir depois do bloqueio.

Em 9 de outubro de 2026, o buscador em [smiles.com.br/portal/home](https://www.smiles.com.br/portal/home) abriu sem login. O tipo de viagem padrão era “Ida e volta”, com 1 viajante e “Todas as classes”. Não envie essa busca assim quando a imagem não disser ida e volta: troque para somente ida, ou pare e marque o escopo como não identificado. O campo de data é um calendário, não texto livre. Sem um dia na imagem, não escolha um dia e não trate o preço de um dia qualquer como a oferta.

Tabela fixa do LATAM Pass para voo de parceira não sai no site como uma busca comum. Não trate a ausência no site como prova de que a tabela não existe. O próximo passo, nesse caso, é o canal oficial do LATAM Pass, não um palpite.

## Preço em dinheiro

1. Fli/Google Flights para localizar rapidamente a tarifa, marcada como fonte secundária.
2. Site oficial da companhia que opera o voo, na mesma rota, data, cabine e número de passageiros, para confirmação.

Não há API oficial ou paga de tarifa configurada neste projeto. Se o Fli e a página oficial não carregarem o preço, escreva “não confirmado”. Não estime pela memória nem por um mês inteiro quando a imagem tiver um dia específico, e não escolha um dia quando a imagem só tiver o mês.

Ao comparar, registre o que estiver visível: bagagem, tarifa flexível ou restrita, escalas, duração e se o preço é por trecho ou ida e volta. Se a tarifa em dinheiro for de outro tipo, diga a diferença na tabela, na linha do preço, em vez de misturar os valores.

## Ordem prática

1. Leia a imagem e separe o programa da emissão da companhia que opera.
2. Abra o site oficial do programa da emissão e busque a data exata. Se só houver mês, use a visão do mês e não escolha um dia.
3. Confira cabine, companhia, milhas, taxas e restrição de clube ou categoria.
4. Se a página pedir login, CAPTCHA ou bloqueio, pare e marque a consulta como inconclusiva.
5. Busque a tarifa em dinheiro com o Fli e, quando possível, confirme no site de quem opera.
6. Grave fonte, horário (America/Sao_Paulo) e URL em cada consulta.
