import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// AI Endpoint: Chat / Problem solver
app.post("/api/ai/chat", async (req, res) => {
  try {
    const { messages, calcContext } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Invalid messages format" });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured in the environment.",
        reply: "AI key is currently not configured. Please ensure GEMINI_API_KEY is set in Settings > Secrets.",
      });
    }

    const userMessage = messages[messages.length - 1]?.content || "";

    const systemInstruction = `You are the Casio Scientific Calculator AI Assistant ("Casio AI Bot" or "ClassWiz AI Copilot").
You are an expert mathematician, physicist, engineer, and Casio fx-991EX/fx-82MS specialist.
The user is working with an authentic Casio scientific calculator on their screen.

Current Calculator State:
- Active Expression: "${calcContext?.expression || "None"}"
- Active Result: "${calcContext?.result || "0"}"
- Angle Unit: "${calcContext?.angleUnit || "DEG"}"
- Memory M: "${calcContext?.memory || "0"}"

Your responsibilities:
1. Explain mathematical calculations, derivations, theorems, physics formulas, and engineering computations.
2. Provide step-by-step solutions to math problems (algebra, trigonometry, calculus, matrices, statistics, physics).
3. Suggest the exact keystrokes or Casio syntax (e.g. sin(30), √(16), 5P3, 10C2, 2×10^5, log(100), ln(e)) so the user can easily calculate it.
4. If you produce a single concise formula/expression the user can evaluate on the Casio calculator, output a special block at the very end formatted as:
[CALC_INSERT: expression]
For example:
[CALC_INSERT: sin(45) * √(2)]
The calculator UI detects [CALC_INSERT: ...] and gives the user an instant "Insert into Casio" button!
5. Format your explanations cleanly with clear markdown, bullet points, and neat mathematical notation. Keep answers concise, clear, and friendly.`;

    // Map message history
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "No response generated.";
    return res.json({ reply: replyText });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    return res.status(500).json({
      error: error.message || "Failed to generate AI response",
      reply: "Sorry, an error occurred while processing your request. Please try again.",
    });
  }
});

// AI Endpoint: Explain Displayed Calculation
app.post("/api/ai/explain", async (req, res) => {
  try {
    const { expression, result, angleUnit } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is missing",
        reply: "AI key not configured.",
      });
    }

    const prompt = `Please explain this calculation from a Casio Scientific Calculator:
Expression: ${expression}
Computed Result: ${result}
Current Angle Mode: ${angleUnit || "DEG"}

Explain:
1. What this mathematical operation does.
2. Step-by-step breakdown of how the result is derived.
3. Any significant properties, alternate representations (e.g., exact fraction, radicals, radians if applicable), or real-world/scientific application.
4. Casio keypad tips or shortcuts related to this type of problem.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a concise, lucid math tutor for the Casio Scientific Calculator. Format with crisp markdown.",
      },
    });

    return res.json({ reply: response.text || "" });
  } catch (error: any) {
    console.error("AI Explain error:", error);
    return res.status(500).json({ error: error.message || "Error explaining calculation" });
  }
});

// AI Endpoint: Quick Solve & Convert to Casio Expression
app.post("/api/ai/convert-problem", async (req, res) => {
  try {
    const { problem } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing" });
    }

    const prompt = `Given the user's math problem: "${problem}"
1. Provide a direct, step-by-step solution.
2. Provide the exact Casio calculator syntax to compute it.
3. At the very end, include the exact Casio input on its own line:
[CALC_INSERT: expression]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a specialized math solver that formats formulas for a Casio scientific calculator.",
      },
    });

    return res.json({ reply: response.text || "" });
  } catch (error: any) {
    console.error("AI Convert error:", error);
    return res.status(500).json({ error: error.message || "Error converting problem" });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
