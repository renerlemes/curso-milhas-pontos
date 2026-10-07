(() => {
	var STORAGE_KEY = "mp-course-progress";
	var NUMBER_PATTERN = /^(\d+)-/;
	var body = document.body;
	var root = body.dataset.root || "";
	var currentId = body.dataset.lesson || null;

	var course = { modules: [] };
	var lessons = [];
	var validIds = new Set();
	var currentIndex = -1;
	var current = null;

	function url(href) {
		return encodeURI(root + href);
	}

	function parseNumber(name) {
		var match = NUMBER_PATTERN.exec(name);
		return match ? Number(match[1]) : null;
	}

	function lessonTitle(modInfo, number) {
		var aulas = (modInfo && modInfo.aulas) || [];
		var found = aulas.find((aula) => Number(aula.numero) === number);
		return found && found.titulo ? found.titulo : `Aula ${number}`;
	}

	/* O `serve` devolve a listagem da pasta em JSON quando o pedido aceita JSON. */
	function listFolder(path) {
		return fetch(url(path), { headers: { Accept: "application/json" } })
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP ${res.status} em ${path}`);
				return res.json();
			})
			.then((data) => data.files || []);
	}

	function loadModuleInfo() {
		return fetch(url("content/modulos.json"))
			.then((res) => (res.ok ? res.json() : { modulos: [] }))
			.catch(() => ({ modulos: [] }))
			.then(
				(data) =>
					new Map((data.modulos || []).map((m) => [Number(m.numero), m])),
			);
	}

	function loadLessons(mod) {
		return listFolder(`content/${mod.folder}/`).then((files) => {
			var seen = new Set();
			return files
				.filter((f) => f.type === "file" && /\.html$/i.test(f.base))
				.map((f) => ({
					file: f.base,
					number: parseNumber(f.base.slice(0, -5)),
				}))
				.filter((f) => {
					if (f.number == null || seen.has(f.number)) return false;
					seen.add(f.number);
					return true;
				})
				.sort((a, b) => a.number - b.number)
				.map((f) => ({
					id: `m${mod.number}-a${f.number}`,
					number: f.number,
					title: lessonTitle(mod.info, f.number),
					href: `content/${mod.folder}/${f.file}`,
				}));
		});
	}

	function loadCourse() {
		return Promise.all([loadModuleInfo(), listFolder("content/")]).then(
			(results) => {
				var info = results[0];
				var byNumber = new Map();
				results[1].forEach((f) => {
					if (f.type !== "folder") return;
					var folder = f.base.replace(/\/$/, "");
					var number = parseNumber(folder);
					if (number == null || byNumber.has(number)) return;
					var meta = info.get(number);
					byNumber.set(number, {
						number,
						title: meta && meta.titulo ? meta.titulo : `Módulo ${number}`,
						folder,
						info: meta || null,
					});
				});
				info.forEach((m, number) => {
					if (!byNumber.has(number)) {
						byNumber.set(number, {
							number,
							title: m.titulo,
							folder: null,
							info: m,
						});
					}
				});

				var mods = Array.from(byNumber.values()).sort(
					(a, b) => a.number - b.number,
				);
				return Promise.all(
					mods.map((mod) =>
						(mod.folder ? loadLessons(mod) : Promise.resolve([])).then(
							(modLessons) => ({
								id: `m${mod.number}`,
								title: mod.title,
								description: info.get(mod.number)?.descricao ?? "",
								lessons: modLessons,
							}),
						),
					),
				).then((modules) => ({ modules }));
			},
		);
	}

	function useCourse(data) {
		course = data;
		lessons = [];
		course.modules.forEach((mod, mIdx) => {
			mod.lessons.forEach((lesson, lIdx) => {
				lessons.push({
					lesson: lesson,
					module: mod,
					moduleNumber: mIdx + 1,
					lessonNumber: lIdx + 1,
				});
			});
		});
		validIds = new Set(lessons.map((item) => item.lesson.id));
		currentIndex = lessons.findIndex((item) => item.lesson.id === currentId);
		current = currentIndex >= 0 ? lessons[currentIndex] : null;
	}

	function showLoadError() {
		var message =
			"Não foi possível carregar o menu. Rode yarn start na raiz do projeto e abra http://localhost:3000/curso/.";
		["curriculum", "module-index"].forEach((id) => {
			var target = document.getElementById(id);
			if (target) target.replaceChildren(el("p", "muted", message));
		});
	}

	function loadProgress() {
		try {
			const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
			return new Set(Array.isArray(saved) ? saved : []);
		} catch {
			return new Set();
		}
	}

	var completed = loadProgress();

	function saveProgress() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(completed)));
		} catch {
			/* armazenamento indisponível: o progresso vale só nesta visita */
		}
	}

	function el(tag, className, text) {
		var node = document.createElement(tag);
		if (className) node.className = className;
		if (text !== undefined) node.textContent = text;
		return node;
	}

	function renderNav() {
		var nav = document.getElementById("curriculum");
		if (!nav) return;
		nav.innerHTML = "";

		course.modules.forEach((mod, idx) => {
			var isCurrent = current && current.module.id === mod.id;
			var startOpen = current ? isCurrent : idx === 0;

			var wrap = el(
				"div",
				`module${startOpen ? " open" : ""}${isCurrent ? " current" : ""}`,
			);
			var listId = `nav-${mod.id}`;

			var head = el("button", "module-head");
			head.type = "button";
			head.setAttribute("aria-expanded", String(startOpen));
			head.setAttribute("aria-controls", listId);
			head.appendChild(el("span", "module-num", String(idx + 1)));
			head.appendChild(el("span", "module-title", mod.title));
			var chevron = el("span", "chevron");
			chevron.setAttribute("aria-hidden", "true");
			chevron.innerHTML =
				'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>';
			head.appendChild(chevron);
			head.addEventListener("click", () => {
				var open = wrap.classList.toggle("open");
				head.setAttribute("aria-expanded", String(open));
			});

			var list = el("ul", "module-lessons");
			list.id = listId;

			if (!mod.lessons.length) {
				list.appendChild(el("li", "module-empty", "Em breve"));
			}

			mod.lessons.forEach((lesson) => {
				var li = el("li");
				var link = el("a", "lesson-link");
				link.href = url(lesson.href);
				link.dataset.lessonId = lesson.id;
				if (lesson.id === currentId) {
					link.classList.add("active");
					link.setAttribute("aria-current", "page");
				}
				link.appendChild(el("span", "lesson-num", String(lesson.number)));
				link.appendChild(el("span", "lesson-link-label", lesson.title));
				var check = el("span", "lesson-check", "✓");
				check.setAttribute("aria-hidden", "true");
				link.appendChild(check);
				link.appendChild(el("span", "sr-only lesson-status"));
				li.appendChild(link);
				list.appendChild(li);
			});

			wrap.appendChild(head);
			wrap.appendChild(list);
			nav.appendChild(wrap);
		});
	}

	function updateCompletedMarks() {
		document
			.querySelectorAll(".lesson-link[data-lesson-id]")
			.forEach((link) => {
				var done = completed.has(link.dataset.lessonId);
				link.classList.toggle("completed", done);
				var status = link.querySelector(".lesson-status");
				if (status) status.textContent = done ? " (concluída)" : "";
			});
	}

	function doneCount() {
		var n = 0;
		completed.forEach((id) => {
			if (validIds.has(id)) n += 1;
		});
		return n;
	}

	function updateProgress() {
		var total = lessons.length;
		var done = doneCount();
		var pct = total ? Math.round((done / total) * 100) : 0;
		var count = document.getElementById("progress-count");
		var fill = document.getElementById("progress-fill");
		var pctEl = document.getElementById("progress-pct");
		var bar = document.getElementById("progress-bar");
		if (count) count.textContent = `${done} / ${total}`;
		if (fill) fill.style.width = `${pct}%`;
		if (pctEl) pctEl.textContent = `${pct}% concluído`;
		if (bar) {
			bar.setAttribute("aria-valuenow", String(pct));
			bar.setAttribute(
				"aria-label",
				`Progresso do curso: ${done} de ${total} aulas concluídas`,
			);
		}
		updateCompletedMarks();
		renderModuleIndex();
	}

	function setupToggle() {
		var btn = document.getElementById("btn-toggle-complete");
		if (!btn) return;
		if (!current) {
			btn.hidden = true;
			return;
		}
		function paint() {
			var done = completed.has(current.lesson.id);
			btn.textContent = done
				? "✓ Concluída · Marcar como não concluída"
				: "Marcar como concluída";
			btn.classList.toggle("done", done);
			btn.setAttribute("aria-pressed", String(done));
		}
		btn.addEventListener("click", () => {
			var id = current.lesson.id;
			if (completed.has(id)) completed.delete(id);
			else completed.add(id);
			saveProgress();
			paint();
			updateProgress();
		});
		paint();
	}

	function renderPager() {
		var pager = document.getElementById("lesson-pager");
		if (!pager || !current) return;
		pager.innerHTML = "";

		var prev = lessons[currentIndex - 1];
		var next = lessons[currentIndex + 1];

		if (prev) {
			const a = el("a", "btn", "← Aula anterior");
			a.href = url(prev.lesson.href);
			a.setAttribute("aria-label", `Aula anterior: ${prev.lesson.title}`);
			pager.appendChild(a);
		}

		if (next) {
			const b = el("a", "btn primary", "Próxima aula →");
			b.href = url(next.lesson.href);
			b.setAttribute("aria-label", `Próxima aula: ${next.lesson.title}`);
			pager.appendChild(b);
		}
	}

	function renderModuleIndex() {
		var container = document.getElementById("module-index");
		if (!container) return;
		container.innerHTML = "";

		course.modules.forEach((mod, idx) => {
			var card = el("article", "card soft module-card");
			card.id = mod.id;
			card.appendChild(el("div", "card-label", `Módulo ${idx + 1}`));
			card.appendChild(el("h3", "", mod.title));
			card.appendChild(el("p", "muted", mod.description || ""));

			var foot = el("div", "module-card-foot");

			if (mod.lessons.length) {
				const list = el("ol", "module-card-lessons");
				let doneHere = 0;
				let firstPending = null;
				mod.lessons.forEach((lesson) => {
					var li = el("li");
					var a = el("a", "", lesson.title);
					a.href = url(lesson.href);
					li.appendChild(a);
					if (completed.has(lesson.id)) {
						doneHere += 1;
						const mark = el("span", "done-mark", " ✓");
						mark.setAttribute("aria-label", "concluída");
						li.appendChild(mark);
					} else if (!firstPending) {
						firstPending = lesson;
					}
					list.appendChild(li);
				});
				card.appendChild(list);

				foot.appendChild(
					el(
						"span",
						"module-card-count",
						`${doneHere} de ${mod.lessons.length} aulas concluídas`,
					),
				);
				const target = firstPending || mod.lessons[0];
				const label =
					doneHere === 0
						? "Começar módulo"
						: firstPending
							? "Continuar"
							: "Rever módulo";
				const go = el("a", "btn primary", `${label} →`);
				go.href = url(target.href);
				foot.appendChild(go);
			} else {
				foot.appendChild(el("span", "tag", "Em breve"));
			}

			card.appendChild(foot);
			container.appendChild(card);
		});
	}

	loadCourse()
		.then((data) => {
			useCourse(data);
			renderNav();
			setupToggle();
			renderPager();
			updateProgress();
		})
		.catch(showLoadError);
})();
