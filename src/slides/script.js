(() => {
	var NUMBER_PATTERN = /^(\d+)-/;

	var stage = document.getElementById("stage");
	var counter = document.getElementById("deck-count");
	var progress = document.getElementById("deck-progress");
	var prev = document.getElementById("deck-prev");
	var next = document.getElementById("deck-next");
	var slides = [];
	var current = 0;

	function fit() {
		var scale =
			Math.min(window.innerWidth / 1280, window.innerHeight / 720) * 0.92;
		slides.forEach((slide) => {
			slide.style.transform = `scale(${scale})`;
		});
	}

	function show(index) {
		if (!slides.length) return;
		current = Math.max(0, Math.min(slides.length - 1, index));
		slides.forEach((slide, i) => {
			slide.classList.toggle("active", i === current);
		});
		counter.textContent = `${current + 1} / ${slides.length}`;
		progress.style.width = `${((current + 1) / slides.length) * 100}%`;
		prev.disabled = current === 0;
		next.disabled = current === slides.length - 1;
		var key = slides[current].dataset.slide;
		if (key && window.location.hash !== `#${key}`) {
			history.replaceState(null, "", `#${key}`);
		}
	}

	function assignKeys() {
		var moduleNumber = 0;
		var lesson = 0;
		slides.forEach((slide) => {
			if (slide.classList.contains("cover-module")) {
				var raw = slide.querySelector(".cover-number");
				var parsed = raw ? parseInt(raw.textContent, 10) : NaN;
				moduleNumber = Number.isFinite(parsed) ? parsed : moduleNumber + 1;
				lesson = 0;
				slide.dataset.slide = `m${moduleNumber}`;
				return;
			}
			if (slide.classList.contains("closing")) {
				slide.dataset.slide = "m8a1";
				return;
			}
			lesson += 1;
			slide.dataset.slide = `m${moduleNumber}a${lesson}`;
		});
	}

	function fromHash() {
		var key = window.location.hash.slice(1).toLowerCase();
		if (!key) return 0;
		var found = slides.findIndex(
			(slide) => (slide.dataset.slide || "").toLowerCase() === key,
		);
		if (found >= 0) return found;
		if (/^\d+$/.test(key)) return parseInt(key, 10) - 1;
		return 0;
	}

	function numberSlides() {
		slides.forEach((slide, i) => {
			var label = slide.querySelector(".slide-num");
			if (label) label.textContent = `Slide ${String(i + 1).padStart(2, "0")}`;
		});
	}

	function loadCalculators() {
		if (!stage.querySelector("[data-calculator]")) return;
		var script = document.createElement("script");
		script.src = "script-calculadoras.js";
		document.body.appendChild(script);
	}

	function toggleFullscreen() {
		if (document.fullscreenElement) document.exitFullscreen();
		else document.documentElement.requestFullscreen();
	}

	function isTyping(target) {
		return (
			target &&
			(target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable)
		);
	}

	function parseNumber(name) {
		var match = NUMBER_PATTERN.exec(name);
		return match ? Number(match[1]) : null;
	}

	function listFolder(path) {
		return fetch(encodeURI(path), { headers: { Accept: "application/json" } })
			.then((response) => {
				if (!response.ok) throw new Error(path);
				return response.json();
			})
			.then((data) => data.files || []);
	}

	function loadCatalog() {
		return fetch("content/modulos.json").then((response) => {
			if (!response.ok) throw new Error("modulos.json");
			return response.json();
		});
	}

	function slidePaths(catalog, files) {
		var byNumber = new Map();
		files.forEach((file) => {
			if (file.type !== "file" || !/\.html$/i.test(file.base)) return;
			var number = parseNumber(file.base.slice(0, -5));
			if (number == null || byNumber.has(number)) return;
			byNumber.set(number, file.base);
		});
		return (catalog.modulos || [])
			.map((mod) => ({
				number: Number(mod.numero),
				file: byNumber.get(Number(mod.numero)),
			}))
			.filter((mod) => mod.file)
			.sort((a, b) => a.number - b.number)
			.map((mod) => `content/${mod.file}`);
	}

	function load() {
		return Promise.all([loadCatalog(), listFolder("content/")])
			.then((results) => {
				var paths = slidePaths(results[0], results[1]);
				if (!paths.length) throw new Error("sem slides");
				return Promise.all(
					paths.map((path) =>
						fetch(encodeURI(path)).then((response) => {
							if (!response.ok) throw new Error(path);
							return response.text();
						}),
					),
				);
			})
			.then((parts) => {
				stage.innerHTML = parts.join("");
				slides = Array.prototype.slice.call(stage.querySelectorAll(".slide"));
				numberSlides();
				assignKeys();
				fit();
				show(fromHash());
				loadCalculators();
			})
			.catch(() => {
				stage.innerHTML =
					'<p class="deck-error">Não foi possível carregar os slides. Abra pelo servidor em http://localhost:3000/slides.</p>';
			});
	}

	prev.addEventListener("click", () => {
		show(current - 1);
	});
	next.addEventListener("click", () => {
		show(current + 1);
	});
	document
		.getElementById("deck-full")
		.addEventListener("click", toggleFullscreen);

	document.addEventListener("keydown", (event) => {
		if (isTyping(event.target)) {
			if (event.key === "Escape") event.target.blur();
			return;
		}
		if (event.target.closest?.("button")) {
			if (event.key === " " || event.key === "Enter") return;
		}
		switch (event.key) {
			case "ArrowRight":
			case "ArrowDown":
			case "PageDown":
			case " ":
				event.preventDefault();
				show(current + 1);
				break;
			case "ArrowLeft":
			case "ArrowUp":
			case "PageUp":
				event.preventDefault();
				show(current - 1);
				break;
			case "Home":
				show(0);
				break;
			case "End":
				show(slides.length - 1);
				break;
			case "f":
			case "F":
				toggleFullscreen();
				break;
		}
	});

	window.addEventListener("resize", fit);
	window.addEventListener("hashchange", () => {
		show(fromHash());
	});

	load();
})();
