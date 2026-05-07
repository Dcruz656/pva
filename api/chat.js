import OpenAI from "openai";

// Inicializar el cliente de OpenAI
// Vercel y otros entornos Node.js inyectarán process.env.OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Asegurarnos de que el endpoint solo reciba peticiones POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "El prompt es requerido" });
    }

    // Llamar al modelo de IA (por ejemplo GPT-3.5-turbo o gpt-4)
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const responseText = completion.choices[0].message.content;

    // Devolver la respuesta en formato JSON
    return res.status(200).json({ response: responseText });
  } catch (error) {
    console.error("Error al llamar a OpenAI:", error);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
