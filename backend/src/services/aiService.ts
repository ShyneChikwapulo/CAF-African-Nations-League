import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY || '', // fallback if not in env. 
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5000',
    'X-Title': 'African Nations League Backend',
  },
});

export const generateMatchCommentary = async (
  teamA: string,
  teamB: string,
  matchEvents: string[]
): Promise<string[]> => {
  try {
    const prompt = `
Generate realistic football match commentary for a match between ${teamA} and ${teamB} in the African Nations League.

Key match events:
${matchEvents.join('\n')}

Return the commentary as a JSON array of strings with minute markers.
Example: ["1': The match kicks off...", "23': GOAL! Amazing strike..."]
`;

    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 2000,
    });

    let commentaryText = response.choices[0]?.message?.content || '';

    // Remove Markdown code fences if present
    commentaryText = commentaryText.replace(/```json|```/g, '').trim();

    try {
      const commentary = JSON.parse(commentaryText);
      return Array.isArray(commentary) ? commentary : [commentaryText];
    } catch {
      // fallback: split by lines
      return commentaryText.split('\n').filter(line => line.trim());
    }
  } catch (error) {
    console.error('Error generating commentary:', error);
    return [
      "The match kicks off in this exciting African Nations League encounter!",
      "Both teams are showing great spirit and determination.",
      "The crowd is electric, creating an amazing atmosphere!"
    ];
  }
};
