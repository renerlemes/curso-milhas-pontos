const http = require("http");
const handler = require("serve-handler");
const config = require("./serve.json");

const PORT = Number(process.env.PORT) || 3000;

function decodePath(pathname) {
	try {
		return decodeURIComponent(pathname);
	} catch {
		return null;
	}
}

function route(pathname) {
	const path = decodePath(pathname);
	if (path === null) return { error: 400 };

	if (
		path === "/src/slides" ||
		path === "/src/slides/" ||
		path === "/src/slides/index.html"
	) {
		return { redirect: "/slides/" };
	}

	if (path === "/slides" || path === "/slides/") {
		return { path: "/src/slides/index.html" };
	}

	if (path.startsWith("/slides/")) {
		return { path: `/src${path}` };
	}

	return { path };
}

const NO_CACHE_HEADERS = {
	"Cache-Control": "no-cache, no-store, must-revalidate",
	Pragma: "no-cache",
	Expires: "0",
};

function asciiHeader(value) {
	return String(value).replace(/[^\t\x20-\x7e]/g, "_");
}

function applyNoCache(response) {
	for (const [name, value] of Object.entries(NO_CACHE_HEADERS)) {
		response.setHeader(name, value);
	}
}

function safeHeaders(response) {
	const setHeader = response.setHeader;
	response.setHeader = (name, value) => {
		if (
			name.toLowerCase() === "content-disposition" &&
			typeof value === "string"
		) {
			return setHeader.call(response, name, asciiHeader(value));
		}
		return setHeader.call(response, name, value);
	};

	const writeHead = response.writeHead;
	response.writeHead = (statusCode, statusMessage, headers) => {
		const target =
			headers && typeof headers === "object"
				? headers
				: statusMessage && typeof statusMessage === "object"
					? statusMessage
					: null;
		if (target) {
			if (typeof target["Content-Disposition"] === "string") {
				target["Content-Disposition"] = asciiHeader(
					target["Content-Disposition"],
				);
			}
			Object.assign(target, NO_CACHE_HEADERS);
		}
		return writeHead.call(response, statusCode, statusMessage, headers);
	};
}

const server = http.createServer((request, response) => {
	safeHeaders(response);
	applyNoCache(response);

	const url = new URL(request.url, "http://127.0.0.1");
	const mapped = route(url.pathname);

	if (mapped.error) {
		response.writeHead(mapped.error);
		response.end("Bad Request");
		return;
	}

	if (mapped.redirect) {
		response.writeHead(302, { Location: mapped.redirect });
		response.end();
		return;
	}

	request.url = encodeURI(mapped.path) + url.search;
	return handler(request, response, config).catch((err) => {
		console.error(err);
		if (!response.headersSent) {
			response.writeHead(500);
			response.end("Internal Server Error");
		}
	});
});

server.listen(PORT, () => {
	console.log(`http://localhost:${PORT}`);
});
