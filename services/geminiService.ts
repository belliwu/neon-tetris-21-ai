import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

const getGenAI = () => {
  if (!genAI && process.env.API_KEY) {
    genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return genAI;
};

export const generateGameCommentary = async (
  event: 'start' | 'line_clear' | 'game_over' | 'level_up',
  details: { linesCleared?: number; score?: number; level?: number }
): Promise<string> => {
  const ai = getGenAI();
  if (!ai) {
    return ""; // Fail silently if no API key
  }

  let prompt = "";
  
  if (event === 'start') {
    prompt = "A player is starting a game of Tetris (Neon/Cyberpunk theme). Give a short, hype, 1-sentence welcome message. Be cool.";
  } else if (event === 'line_clear') {
    if ((details.linesCleared || 0) >= 4) {
      prompt = "The player just scored a Tetris (4 lines)! Give a very short, explosive 5-word maximum hype reaction.";
    } else {
      prompt = `The player cleared ${details.linesCleared} lines. Give a short, encouraging 1-sentence remark.`;
    }
  } else if (event === 'level_up') {
    prompt = `The player just reached Level ${details.level}! Give a short, intense warning that speed is increasing.`;
  } else if (event === 'game_over') {
    prompt = `Game Over! The player scored ${details.score}. Give a short, slightly snarky or comforting 1-sentence remark depending on if the score is good (good is > 2000).`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text.trim();
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "";
  }
};
