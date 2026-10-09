#!/usr/bin/env python3
"""Calcula o custo de uma emissão com milhas.

O agente normaliza os números antes de chamar este script:
milhas como inteiro (52900, nunca 52.900) e dinheiro com ponto decimal
(318.27) ou vírgula decimal sem separador de milhar (318,27).

Sem preço em dinheiro, economia e valor obtido ficam nulos.
Não preenche esses campos com estimativa.

Uso:
  python scripts/calcular-emissao.py --self-test
  python scripts/calcular-emissao.py --milhas 52900 --milhas-max 57700 \\
      --taxas 318.27 --cenario preco-alvo=16 --cenario faixa-alta=18
  python scripts/calcular-emissao.py --json entrada.json
"""

from __future__ import annotations

import argparse
import json
import sys
from decimal import Decimal, ROUND_HALF_UP

CENTAVOS = Decimal("0.01")


def dinheiro(valor: Decimal) -> str:
    return format(valor.quantize(CENTAVOS, rounding=ROUND_HALF_UP), "f")


def parse_dinheiro(texto: str) -> Decimal:
    bruto = texto.strip().replace("R$", "").replace(" ", "")
    if not bruto:
        raise ValueError("valor em dinheiro vazio")
    if "," in bruto and "." in bruto:
        raise ValueError(
            f"não misture ponto e vírgula em '{texto}'. Use 318.27 ou 318,27."
        )
    if "," in bruto:
        bruto = bruto.replace(",", ".")
    try:
        return Decimal(bruto)
    except Exception as exc:
        raise ValueError(f"dinheiro inválido: {texto}") from exc


def parse_milhas(texto: str) -> int:
    bruto = texto.strip().replace(" ", "")
    if not bruto.isdigit():
        raise ValueError(
            f"milhas devem ser um inteiro, sem ponto ou vírgula: recebido '{texto}'."
        )
    valor = int(bruto)
    if valor < 0:
        raise ValueError("milhas não podem ser negativas")
    return valor


def calcular_limite(
    milhas: int, taxas: Decimal, custo_milheiro: Decimal, preco: Decimal | None
) -> dict:
    milheiros = Decimal(milhas) / Decimal(1000)
    custo_equivalente = milheiros * custo_milheiro
    custo_total = custo_equivalente + taxas
    resultado = {
        "milhas": milhas,
        "custo_equivalente_milhas": dinheiro(custo_equivalente),
        "taxas": dinheiro(taxas),
        "custo_total": dinheiro(custo_total),
        "preco_dinheiro": dinheiro(preco) if preco is not None else None,
        "economia": None,
        "economia_percentual": None,
        "valor_obtido_por_milheiro": None,
    }
    if preco is None:
        return resultado
    economia = preco - custo_total
    resultado["economia"] = dinheiro(economia)
    if preco != 0:
        resultado["economia_percentual"] = dinheiro((economia / preco) * Decimal(100))
    if milheiros != 0:
        resultado["valor_obtido_por_milheiro"] = dinheiro((preco - taxas) / milheiros)
    return resultado


def calcular(dados: dict) -> dict:
    milhas_min = parse_milhas(str(dados["milhas"]))
    milhas_max = dados.get("milhas_max")
    if milhas_max is not None and str(milhas_max) != "":
        milhas_max = parse_milhas(str(milhas_max))
        if milhas_max < milhas_min:
            raise ValueError("milhas_max é menor que milhas")
    else:
        milhas_max = None

    taxas = parse_dinheiro(str(dados["taxas"]))
    preco_bruto = dados.get("preco_dinheiro")
    preco = None if preco_bruto in (None, "") else parse_dinheiro(str(preco_bruto))

    cenarios_entrada = dados.get("cenarios") or []
    if not cenarios_entrada:
        raise ValueError("informe ao menos um cenário com custo do milheiro")

    cenarios = []
    for item in cenarios_entrada:
        nome = str(item["nome"])
        custo = parse_dinheiro(str(item["custo_milheiro"]))
        limites = {
            "minimo": calcular_limite(milhas_min, taxas, custo, preco),
        }
        if milhas_max is not None and milhas_max != milhas_min:
            limites["maximo"] = calcular_limite(milhas_max, taxas, custo, preco)
        cenarios.append(
            {
                "nome": nome,
                "tipo": item.get("tipo", "estimativa"),
                "custo_milheiro": dinheiro(custo),
                "limites": limites,
            }
        )

    return {
        "moeda": "BRL",
        "milhas_min": milhas_min,
        "milhas_max": milhas_max,
        "taxas": dinheiro(taxas),
        "preco_dinheiro": dinheiro(preco) if preco is not None else None,
        "preco_dinheiro_status": "informado" if preco is not None else "não confirmado",
        "cenarios": cenarios,
    }


def self_test() -> None:
    sem_preco = calcular(
        {
            "milhas": "52900",
            "milhas_max": "57700",
            "taxas": "318,27",
            "cenarios": [{"nome": "preco-alvo", "custo_milheiro": "16"}],
        }
    )
    minimo = sem_preco["cenarios"][0]["limites"]["minimo"]
    maximo = sem_preco["cenarios"][0]["limites"]["maximo"]
    assert minimo["custo_equivalente_milhas"] == "846.40", minimo
    assert minimo["custo_total"] == "1164.67", minimo
    assert minimo["economia"] is None
    assert minimo["valor_obtido_por_milheiro"] is None
    assert maximo["custo_equivalente_milhas"] == "923.20", maximo
    assert maximo["custo_total"] == "1241.47", maximo
    assert sem_preco["preco_dinheiro_status"] == "não confirmado"

    com_preco = calcular(
        {
            "milhas": 52900,
            "milhas_max": 57700,
            "taxas": "318.27",
            "preco_dinheiro": "2500.00",
            "cenarios": [
                {"nome": "preco-alvo", "tipo": "estimativa", "custo_milheiro": "16.00"}
            ],
        }
    )
    cheio = com_preco["cenarios"][0]["limites"]
    assert cheio["minimo"]["economia"] == "1335.33", cheio["minimo"]
    assert cheio["minimo"]["economia_percentual"] == "53.41", cheio["minimo"]
    assert cheio["minimo"]["valor_obtido_por_milheiro"] == "41.24", cheio["minimo"]
    assert cheio["maximo"]["economia"] == "1258.53", cheio["maximo"]
    assert cheio["maximo"]["economia_percentual"] == "50.34", cheio["maximo"]
    assert cheio["maximo"]["valor_obtido_por_milheiro"] == "37.81", cheio["maximo"]

    try:
        parse_milhas("52.900")
    except ValueError:
        pass
    else:
        raise AssertionError("52.900 não pode ser aceito como milhas")

    print("self-test ok")


def carregar_args(argv: list[str]) -> dict:
    parser = argparse.ArgumentParser(description="Calcula emissão com milhas")
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--json", help="Arquivo JSON ou - para stdin")
    parser.add_argument("--milhas")
    parser.add_argument("--milhas-max")
    parser.add_argument("--taxas")
    parser.add_argument("--preco-dinheiro")
    parser.add_argument(
        "--cenario",
        action="append",
        default=[],
        help="nome=custo, por exemplo preco-alvo=16",
    )
    args = parser.parse_args(argv)
    if args.self_test:
        self_test()
        return {}
    if args.json:
        if args.json == "-":
            return json.load(sys.stdin)
        with open(args.json, encoding="utf-8") as arquivo:
            return json.load(arquivo)
    if not args.milhas or not args.taxas or not args.cenario:
        parser.error("informe --json ou --milhas, --taxas e ao menos um --cenario")
    cenarios = []
    for item in args.cenario:
        if "=" not in item:
            raise ValueError(f"cenário inválido: {item}")
        nome, custo = item.split("=", 1)
        cenarios.append({"nome": nome, "tipo": "estimativa", "custo_milheiro": custo})
    return {
        "milhas": args.milhas,
        "milhas_max": args.milhas_max,
        "taxas": args.taxas,
        "preco_dinheiro": args.preco_dinheiro,
        "cenarios": cenarios,
    }


def main(argv: list[str]) -> int:
    try:
        dados = carregar_args(argv)
    except (ValueError, json.JSONDecodeError, OSError) as exc:
        print(str(exc), file=sys.stderr)
        return 2
    if not dados:
        return 0
    try:
        print(json.dumps(calcular(dados), ensure_ascii=False, indent=2))
    except ValueError as exc:
        print(str(exc), file=sys.stderr)
        return 2
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
