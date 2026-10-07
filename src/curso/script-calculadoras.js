(() => {
	function groupDigits(digits) {
		return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
	}

	function formatIntegerInput(raw) {
		var digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
		return digits ? groupDigits(digits) : "";
	}

	function formatMoneyInput(raw) {
		var digits = raw.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
		if (!digits) return "";
		while (digits.length < 3) digits = `0${digits}`;
		return `${groupDigits(digits.slice(0, -2))},${digits.slice(-2)}`;
	}

	function formatDecimalInput(raw) {
		var cleaned = raw.replace(/\./g, "").replace(/[^\d,]/g, "");
		var comma = cleaned.indexOf(",");
		var ints = comma >= 0 ? cleaned.slice(0, comma) : cleaned;
		var decimals =
			comma >= 0
				? cleaned
						.slice(comma + 1)
						.replace(/\D/g, "")
						.slice(0, 4)
				: null;
		ints = ints.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
		if (!ints && decimals === null) return "";
		var formatted = groupDigits(ints || "0");
		return decimals === null ? formatted : `${formatted},${decimals}`;
	}

	function caretAfterDigits(formatted, digitCount) {
		var seen = 0;
		var index;
		if (digitCount <= 0) return 0;
		for (index = 0; index < formatted.length; index += 1) {
			if (/\d/.test(formatted.charAt(index))) seen += 1;
			if (seen >= digitCount) return index + 1;
		}
		return formatted.length;
	}

	function applyMask(input) {
		var formatted =
			input.dataset.mask === "decimal"
				? formatDecimalInput(input.value)
				: formatIntegerInput(input.value);
		var caret = input.selectionStart || 0;
		var digitsBefore = input.value.slice(0, caret).replace(/\D/g, "").length;
		if (formatted === input.value) return;
		input.value = formatted;
		if (input === document.activeElement) {
			caret = caretAfterDigits(formatted, digitsBefore);
			input.setSelectionRange(caret, caret);
		}
	}

	function countDigitsBefore(value, caret) {
		return value.slice(0, caret).replace(/\D/g, "").length;
	}

	function mapMoneyCaret(raw, caretIndex) {
		var leadingMatch;
		var leading;
		var significant;
		var pad;
		if (!raw) return { digits: "", caret: 0 };
		leadingMatch = raw.match(/^0*/);
		leading = leadingMatch ? leadingMatch[0].length : 0;
		significant = raw.slice(leading);
		if (!significant) return { digits: "000", caret: caretIndex <= 0 ? 0 : 3 };
		pad = significant.length < 3 ? 3 - significant.length : 0;
		return {
			digits: new Array(pad + 1).join("0") + significant,
			caret: Math.min(
				pad + caretIndex - Math.min(leading, caretIndex),
				pad + significant.length,
			),
		};
	}

	function paintMoney(input, raw, caretInRaw) {
		var mapped = mapMoneyCaret(raw, caretInRaw);
		var formatted = mapped.digits ? formatMoneyInput(mapped.digits) : "";
		var caret = formatted ? caretAfterDigits(formatted, mapped.caret) : 0;
		input.value = formatted;
		input.dataset.moneyValue = formatted;
		if (input === document.activeElement) input.setSelectionRange(caret, caret);
	}

	function editMoneyDigits(digits, start, text) {
		var chars = digits.split("");
		var added = text.split("");
		if (start < chars.length) {
			chars.splice(start, Math.min(chars.length - start, added.length));
			chars = chars.slice(0, start).concat(added, chars.slice(start));
		} else {
			chars = chars.concat(added);
		}
		return { raw: chars.join(""), caret: start + added.length };
	}

	function diffChange(previous, current) {
		var prefix = 0;
		var suffix = 0;
		var maxPrefix = Math.min(previous.length, current.length);
		while (
			prefix < maxPrefix &&
			previous.charAt(prefix) === current.charAt(prefix)
		)
			prefix += 1;
		while (
			suffix < previous.length - prefix &&
			suffix < current.length - prefix &&
			previous.charAt(previous.length - 1 - suffix) ===
				current.charAt(current.length - 1 - suffix)
		) {
			suffix += 1;
		}
		return {
			prefix: prefix,
			inserted: current.slice(prefix, current.length - suffix),
			deleted: previous.slice(prefix, previous.length - suffix),
		};
	}

	function handleMoneyInput(input) {
		var previous = input.dataset.moneyValue || "";
		var current = input.value;
		var caret = input.selectionStart || 0;
		var change;
		var edited;
		if (current === previous) return;
		change = diffChange(previous, current);
		if (change.inserted && !change.deleted && /^\d+$/.test(change.inserted)) {
			edited = editMoneyDigits(
				previous.replace(/\D/g, ""),
				countDigitsBefore(previous, change.prefix),
				change.inserted,
			);
			paintMoney(input, edited.raw, edited.caret);
			return;
		}
		paintMoney(
			input,
			current.replace(/\D/g, ""),
			countDigitsBefore(current, caret),
		);
	}

	function readNumber(input) {
		var value = input.value.trim().replace(/[^\d,.-]/g, "");
		var parts;
		if (!value) return NaN;

		var comma = value.lastIndexOf(",");
		var dot = value.lastIndexOf(".");

		if (comma >= 0 && dot >= 0) {
			if (comma > dot) {
				value = value.replace(/\./g, "").replace(",", ".");
			} else {
				value = value.replace(/,/g, "");
			}
		} else if (comma >= 0) {
			value = value.replace(",", ".");
		} else if (dot >= 0) {
			parts = value.split(".");
			if (parts.length > 2 || (parts.length === 2 && parts[1].length === 3)) {
				value = parts.join("");
			}
		}

		return Number(value);
	}

	function formatNumber(value, decimals) {
		if (!Number.isFinite(value)) return "—";
		return new Intl.NumberFormat("pt-BR", {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		}).format(value);
	}

	function formatMoney(value) {
		if (!Number.isFinite(value)) return "—";
		return new Intl.NumberFormat("pt-BR", {
			style: "currency",
			currency: "BRL",
		}).format(value);
	}

	function setOutput(calculator, name, value) {
		var output = calculator.querySelector(`[data-output="${name}"]`);
		if (output) output.textContent = value;
	}

	function setNegative(calculator, name, isNegative) {
		var output = calculator.querySelector(`[data-output="${name}"]`);
		if (output)
			output
				.closest(".calculator-result")
				.classList.toggle("negative", isNegative);
	}

	function value(calculator, name) {
		return readNumber(calculator.querySelector(`[name="${name}"]`));
	}

	function calculatePurchase(calculator) {
		var points = value(calculator, "points");
		var paid = value(calculator, "paid");
		var cpm = points > 0 && paid >= 0 ? (paid / points) * 1000 : NaN;
		setOutput(calculator, "cpm", formatMoney(cpm));
	}

	function calculateTransfer(calculator) {
		var points = value(calculator, "points");
		var paid = value(calculator, "paid");
		var bonus = value(calculator, "bonus");
		var ratio = value(calculator, "ratio");

		var received =
			points > 0 && ratio > 0 && bonus >= 0
				? (points / ratio) * (1 + bonus / 100)
				: NaN;
		var purchaseCpm = points > 0 && paid >= 0 ? (paid / points) * 1000 : NaN;
		var transferCpm =
			received > 0 && paid >= 0 ? (paid / received) * 1000 : NaN;

		setOutput(calculator, "received", formatNumber(received, 0));
		setOutput(calculator, "purchase-cpm", formatMoney(purchaseCpm));
		setOutput(calculator, "transfer-cpm", formatMoney(transferCpm));
	}

	function calculateEmission(calculator) {
		var miles = value(calculator, "miles");
		var cashFare = value(calculator, "cash-fare");
		var fees = value(calculator, "fees");
		var ownCpm = value(calculator, "own-cpm");

		var redemptionValue =
			miles > 0 && cashFare >= 0 && fees >= 0
				? ((cashFare - fees) / miles) * 1000
				: NaN;
		var realCost =
			miles > 0 && ownCpm >= 0 && fees >= 0
				? (miles / 1000) * ownCpm + fees
				: NaN;
		var savings =
			Number.isFinite(realCost) && cashFare >= 0 ? cashFare - realCost : NaN;
		var savingsPct =
			cashFare > 0 && Number.isFinite(savings)
				? (savings / cashFare) * 100
				: NaN;

		setOutput(calculator, "redemption-value", formatMoney(redemptionValue));
		setOutput(calculator, "real-cost", formatMoney(realCost));
		setOutput(calculator, "savings", formatMoney(savings));
		setOutput(
			calculator,
			"savings-pct",
			Number.isFinite(savingsPct) ? `${formatNumber(savingsPct, 2)}%` : "—",
		);
		setNegative(calculator, "savings", savings < 0);
		setNegative(calculator, "savings-pct", savingsPct < 0);
	}

	function optionalPoints(calculator, name) {
		var field = calculator.querySelector(`[name="${name}"]`);
		var points;
		if (!field || !field.value.trim()) return null;
		points = readNumber(field);
		return points > 0 ? points : null;
	}

	function optionalAmount(calculator, name) {
		var field = calculator.querySelector(`[name="${name}"]`);
		var amount;
		if (!field || !field.value.trim()) return null;
		amount = readNumber(field);
		return Number.isFinite(amount) && amount >= 0 ? amount : null;
	}

	function legCost(points, taxes, reference) {
		var hasPoints = points != null;
		if (!hasPoints && taxes == null) return NaN;
		if (hasPoints && !Number.isFinite(reference)) return NaN;
		return ((hasPoints ? points : 0) / 1000) * (hasPoints ? reference : 0) +
			(taxes != null ? taxes : 0);
	}

	function legPhrase(points, taxes) {
		var parts = [];
		if (points != null) parts.push(`${formatNumber(points, 0)} pontos`);
		if (taxes != null) parts.push(`${formatMoney(taxes)} de taxas`);
		return parts.join(" e ");
	}

	function legLabel(name, points, taxes) {
		var phrase = legPhrase(points, taxes);
		return phrase ? `${name} · ${phrase}` : name;
	}

	function setLabel(calculator, name, text) {
		var label = calculator.querySelector(`[data-label="${name}"]`);
		if (label) label.textContent = text;
	}

	function calculateAward(calculator) {
		var programField = calculator.querySelector('[name="program"]');
		var programOption = programField?.selectedOptions?.[0];
		var reference = programOption
			? Number(programOption.dataset.reference)
			: NaN;
		var programName =
			programOption && programOption.value
				? programOption.textContent.trim()
				: "";
		var note = calculator.querySelector("[data-reference-note]");
		var cabinField = calculator.querySelector('[name="cabin"]');
		var cabinOption = cabinField?.selectedOptions?.[0];
		var cabinName =
			cabinOption && cabinOption.value ? cabinOption.textContent.trim() : "";
		var outbound = optionalPoints(calculator, "points-out");
		var inbound = optionalPoints(calculator, "points-back");
		var outboundFees = optionalAmount(calculator, "fees-out");
		var inboundFees = optionalAmount(calculator, "fees-back");
		var outboundValue = legCost(outbound, outboundFees, reference);
		var inboundValue = legCost(inbound, inboundFees, reference);
		var totalValue =
			Number.isFinite(outboundValue) || Number.isFinite(inboundValue)
				? (Number.isFinite(outboundValue) ? outboundValue : 0) +
					(Number.isFinite(inboundValue) ? inboundValue : 0)
				: NaN;
		var detail = calculator.querySelector('[data-summary="detail"]');
		var bits = [];
		var legs = [];

		if ((outbound != null || inbound != null) && !Number.isFinite(reference)) {
			totalValue = NaN;
		}
		if (note) note.classList.toggle("is-blank", !Number.isFinite(reference));
		setOutput(
			calculator,
			"reference",
			Number.isFinite(reference) ? formatMoney(reference) : "—",
		);
		setLabel(
			calculator,
			"outbound",
			legLabel("Ida", outbound, outboundFees),
		);
		setLabel(
			calculator,
			"inbound",
			legLabel("Volta", inbound, inboundFees),
		);
		setOutput(calculator, "outbound", formatMoney(outboundValue));
		setOutput(calculator, "inbound", formatMoney(inboundValue));
		setOutput(calculator, "total", formatMoney(totalValue));

		if (!detail) return;
		if (cabinName) bits.push(cabinName);
		if (programName) bits.push(programName);
		if (Number.isFinite(outboundValue))
			legs.push(`${legPhrase(outbound, outboundFees)} na ida`);
		if (Number.isFinite(inboundValue))
			legs.push(`${legPhrase(inbound, inboundFees)} na volta`);
		if (legs.length) bits.push(legs.join(" e "));
		detail.textContent = Number.isFinite(totalValue) ? bits.join(" · ") : "";
	}

	var calculators = document.querySelectorAll("[data-calculator]");
	calculators.forEach((calculator) => {
		var type = calculator.dataset.calculator;
		var calculate =
			type === "purchase"
				? calculatePurchase
				: type === "transfer"
					? calculateTransfer
					: type === "award"
						? calculateAward
						: calculateEmission;

		function onEdit(event) {
			var field = event.target;
			if (field.classList?.contains("calculator-input") && field.dataset.mask) {
				if (field.dataset.mask === "money") handleMoneyInput(field);
				else applyMask(field);
			}
			calculate(calculator);
		}

		calculator.querySelectorAll(".calculator-input").forEach((field) => {
			if (field.dataset.mask === "money") {
				field.dataset.moneyValue = formatMoneyInput(field.value);
				field.value = field.dataset.moneyValue;
			} else if (field.dataset.mask) {
				applyMask(field);
			}
		});
		calculator.addEventListener("input", onEdit);
		calculator.addEventListener("change", onEdit);
		calculate(calculator);
	});
})();
