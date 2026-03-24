import { GoogleGenAI } from "@google/genai";

async function generateIcon() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: "A modern, minimalist app icon for a time tracking app called '10,000 Hours'. The design should feature a stylized clock or a progress circle merging into a mountain peak, symbolizing mastery and persistence. Use a sophisticated color palette of deep navy blue, electric blue, and clean white. Flat design, high contrast, professional aesthetic, suitable for iOS. Centered, no text, clean background.",
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1",
        imageSize: "1K"
      },
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      console.log(`DATA_START:${part.inlineData.data}:DATA_END`);
    }
  }
}

generateIcon();
