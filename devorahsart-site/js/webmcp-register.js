const PII_KEYS = new Set([
"email",
"name",
"brief",
"contact",
"contact_info",
"phone",
"first_name",
"last_name",
"company",
]);

export const AGENT_UA_SIGNATURES = [
"ChatGPT-User",
"Claude-Web",
"Claude-User",
"PerplexityBot",
"Perplexity",
"Google-Extended",
"HeadlessChrome",
"Chrome-Headless",
"GPTBot",
];

export const AGENT_REFERRER_HOSTS = [
"chatgpt.com",
"chat.openai.com",
"claude.ai",
"perplexity.ai",
"gemini.google.com",
];

let intentLogPath = "";
let agentVisitObserved = false;

export function configureWebMCP(options = {}) {
if (typeof options.intentPath === "string") {
intentLogPath = options.intentPath.trim();
}
if (options.resetVisit) agentVisitObserved = false;
}

export function getModelContext() {
if (typeof document !== "undefined" && document.modelContext) {
return document.modelContext;
}
if (typeof navigator !== "undefined" && navigator.modelContext) {
return navigator.modelContext;
}
return undefined;
}

export function analyticsArgs(args) {
if (!args || typeof args !== "object") return "";
const safe = {};
for (const [key, value] of Object.entries(args)) {
if (PII_KEYS.has(key)) {
safe[key] = "redacted";
continue;
}
if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
safe[key] = value;
}
}
return JSON.stringify(safe);
}

export function intentFields(args) {
if (!args || typeof args !== "object") return {};
const fields = {};
for (const [key, value] of Object.entries(args)) {
if (PII_KEYS.has(key)) continue;
if (Object.keys(fields).length >= 12) break;
if (typeof value === "string") fields[key] = value.slice(0, 200);
else if (typeof value === "number" || typeof value === "boolean") fields[key] = value;
}
return fields;
}

export function identifyAgentTraffic({ userAgent, referrer } = {}) {
const ua = String(userAgent || "");
const ref = String(referrer || "");
const agent =
AGENT_UA_SIGNATURES.find((signature) => ua.toLowerCase().includes(signature.toLowerCase())) ||
"";
let referrerHost = "";
try {
if (ref) {
const host = new URL(ref).hostname.replace(/^www\./, "").toLowerCase();
referrerHost =
AGENT_REFERRER_HOSTS.find((allowed) => host === allowed || host.endsWith("." + allowed)) ||
"";
}
} catch {
referrerHost = "";
}
return {
agent,
referrerHost,
isAgent: Boolean(agent || referrerHost),
};
}

export function readBrowserAgentSignals() {
const userAgent = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
const referrer = typeof document !== "undefined" ? document.referrer || "" : "";
return identifyAgentTraffic({ userAgent, referrer });
}

export function trackWebMcpAction(toolName) {
const gtag = typeof window !== "undefined" ? window.gtag : undefined;
if (typeof gtag !== "function") return;
gtag("event", "webmcp_action", {
event_category: "AI_Agent",
event_label: String(toolName || ""),
value: 1,
});
}

export function observeAgentVisit() {
if (agentVisitObserved || typeof window === "undefined") return false;
const signals = readBrowserAgentSignals();
if (!signals.isAgent) return false;
agentVisitObserved = true;
const gtag = window.gtag;
if (typeof gtag === "function") {
gtag("event", "webmcp_agent_visit", {
event_category: "AI_Agent",
event_label: signals.agent || signals.referrerHost,
value: 1,
});
}
return true;
}

export function webmcpRequestHeaders(toolName, existing) {
const headers = new Headers(existing || undefined);
const name = String(toolName || "").trim();
if (name) {
headers.set("X-WebMCP-Executed", "true");
headers.set("X-WebMCP-Tool", name);
}
const signals = readBrowserAgentSignals();
if (signals.agent) headers.set("X-WebMCP-Agent", signals.agent);
if (signals.referrerHost) headers.set("X-WebMCP-Referrer-Host", signals.referrerHost);
return headers;
}

export function logAgentIntent(toolName, args) {
if (!intentLogPath) return;
const target = typeof window !== "undefined" ? window : globalThis;
if (typeof target.fetch !== "function") return;
const payload = { tool: String(toolName || ""), ...intentFields(args) };
Promise.resolve(
target.fetch(intentLogPath, {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
keepalive: true,
})
).catch(() => {});
}

function fetchTargets() {
const targets = [];
const seen = new Set();
for (const candidate of [typeof window !== "undefined" ? window : null, globalThis]) {
if (!candidate || seen.has(candidate)) continue;
seen.add(candidate);
if (typeof candidate.fetch === "function") targets.push(candidate);
}
return targets;
}

export async function withWebMcpFetch(toolName, fn) {
const targets = fetchTargets();
if (!targets.length) return fn();

const originals = targets.map((target) => target.fetch.bind(target));
const wrapped = function (input, init) {
return originals[0](input, {
...(init || {}),
headers: webmcpRequestHeaders(toolName, init && init.headers),
});
};

for (const target of targets) {
target.fetch = wrapped;
}

try {
return await fn();
} finally {
targets.forEach((target, i) => {
target.fetch = originals[i];
});
}
}

export function registerWebMCPTool(tool) {
if (typeof window === "undefined") return false;

const modelContext = getModelContext();
if (!modelContext || typeof modelContext.registerTool !== "function") return false;

try {
observeAgentVisit();
modelContext.registerTool({
name: tool.name,
description: tool.description,
inputSchema: tool.inputSchema,
annotations: tool.annotations,
execute: async (args) => {
trackWebMcpAction(tool.name);
return withWebMcpFetch(tool.name, () => {
logAgentIntent(tool.name, args);
return tool.execute(args);
});
},
});
return true;
} catch {
return false;
}
}
