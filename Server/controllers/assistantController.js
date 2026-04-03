const GEMINI_API_BASE =
  "https://generativelanguage.googleapis.com/v1beta/models";
const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const BASE_SYSTEM_PROMPT =
  "You are SmartStudy's AI study assistant. Be concise, friendly, and helpful. If the request is unclear, ask a brief follow-up question.";
const MAX_MESSAGES = 8;
const MAX_MESSAGE_CHARS = 1200;
const MAX_OUTPUT_TOKENS = 512;
const DEFAULT_TIMEOUT_MS = 10000;
const MODEL_LIST_TIMEOUT_MS = 5000;
const FALLBACK_MESSAGE =
  "I am having trouble reaching the AI service right now. Please try again in a moment or ask a shorter question.";

const normalizeModelName = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return DEFAULT_MODEL;
  return raw.startsWith("models/") ? raw.slice("models/".length) : raw;
};

const normalizeRole = (role) => {
  if (role === "assistant" || role === "system") return role;
  return "user";
};

const sanitizeMessages = (messages) => {
  if (!Array.isArray(messages)) return [];

  return messages
    .filter((msg) => msg && typeof msg.content === "string")
    .map((msg) => ({
      role: normalizeRole(msg.role),
      content: msg.content.trim().slice(0, MAX_MESSAGE_CHARS),
    }))
    .filter((msg) => msg.content.length > 0)
    .slice(-MAX_MESSAGES);
};

const parseJson = (text) => {
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
};

const extractErrorMessage = (data) =>
  data?.error?.message || data?.message || "";

const isModelUnavailable = (message, status) =>
  status === 404 || /not found|not supported/i.test(message || "");

const requestGemini = async (modelName, payload, apiKey, timeoutMs) => {
  const endpoint = `${GEMINI_API_BASE}/${encodeURIComponent(
    modelName,
  )}:generateContent?key=${apiKey}`;

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    typeof timeoutMs === "number" ? timeoutMs : DEFAULT_TIMEOUT_MS,
  );

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  const rawText = await response.text();
  const data = parseJson(rawText);
  const message = extractErrorMessage(data);
  const parts = data?.candidates?.[0]?.content?.parts || [];
  const content = parts.map((part) => part?.text || "").join("").trim();

  return { response, data, message, content };
};

const listModels = async (apiKey) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), MODEL_LIST_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_API_BASE}?key=${apiKey}`, {
      signal: controller.signal,
    });
    const rawText = await response.text();
    const data = parseJson(rawText);
    if (!response.ok) return [];
    return Array.isArray(data.models) ? data.models : [];
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
};

const pickFallbackModel = (models) => {
  const supported = (models || []).filter((model) =>
    Array.isArray(model?.supportedGenerationMethods)
      ? model.supportedGenerationMethods.includes("generateContent")
      : false,
  );

  const names = supported
    .map((model) => normalizeModelName(model?.name || ""))
    .filter(Boolean);

  const uniqueNames = Array.from(new Set(names));
  const preferred = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.0-pro",
    "gemini-pro",
  ];

  for (const name of preferred) {
    if (uniqueNames.includes(name)) return name;
  }

  return uniqueNames[0] || "";
};

const resolveFallbackModel = async (apiKey, currentModel) => {
  const models = await listModels(apiKey);
  const fallback = pickFallbackModel(models);
  if (!fallback || fallback === currentModel) return "";
  return fallback;
};

export const createAssistantResponse = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ message: "GEMINI_API_KEY is not configured." });
    }

    if (typeof fetch !== "function") {
      return res.status(500).json({
        message: "Fetch API is not available. Use Node.js 18+.",
      });
    }

    const { messages, model, temperature } = req.body || {};
    const sanitized = sanitizeMessages(messages);

    if (sanitized.length === 0) {
      return res.status(400).json({ message: "Messages are required." });
    }

    const systemParts = [BASE_SYSTEM_PROMPT];
    const contents = [];

    for (const msg of sanitized) {
      if (msg.role === "system") {
        systemParts.push(msg.content);
        continue;
      }

      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    if (contents.length === 0) {
      return res
        .status(400)
        .json({ message: "User messages are required." });
    }

    const payload = {
      contents,
      generationConfig: {
        temperature:
          typeof temperature === "number"
            ? Math.min(Math.max(temperature, 0), 1)
            : 0.3,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      },
      systemInstruction: {
        role: "system",
        parts: [{ text: systemParts.join("\n") }],
      },
    };

    const selectedModel = normalizeModelName(model || DEFAULT_MODEL);
    const result = await requestGemini(selectedModel, payload, apiKey);

    if (!result.response.ok) {
      const shouldFallback = isModelUnavailable(
        result.message,
        result.response.status,
      );

      if (shouldFallback) {
        const fallbackModel = await resolveFallbackModel(
          apiKey,
          selectedModel,
        );

        if (fallbackModel) {
          const retry = await requestGemini(fallbackModel, payload, apiKey);
          if (retry.response.ok) {
            return res.status(200).json({ message: retry.content });
          }

          return res.status(retry.response.status).json({
            message:
              retry.message || "Failed to generate a response with fallback.",
          });
        }
      }

      return res.status(result.response.status).json({
        message: result.message || "Failed to generate a response.",
      });
    }

    return res.status(200).json({ message: result.content });
  } catch (err) {
    if (err?.name === "AbortError") {
      return res.status(200).json({ message: FALLBACK_MESSAGE });
    }

    console.error("assistant chat error:", err);
    return res.status(500).json({ message: "Server error." });
  }
};
