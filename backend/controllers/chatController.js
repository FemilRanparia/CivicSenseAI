
import dotenv from 'dotenv';
dotenv.config();

export const generateChatResponse = async (req, res) => {
  try {
    const { message, language, userProfile } = req.body;
    
    // Fallback if API key is not configured (mock response)
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.log("Using mock response due to missing API key");
      return res.json({ 
        response: `[MOCK MODE] Based on your profile (${userProfile?.state}, Age ${userProfile?.age}): To vote, you need to register first. Go to your local election office or the official website. Let me know if you need help with the next steps!`,
        suggestions: ["How do I register?", "What ID do I need?"]
      });
    }

    const prompt = `
      You are an AI-powered Election Simulation Assistant named CivicSense AI designed to guide users through a realistic, step-by-step simulation of the voting process in India.
      Your goal is NOT just to explain, but to simulate the experience in an interactive, structured, and easy-to-follow way.

      User Details:
      - Age: ${userProfile?.age || 'Unknown'}
      - State: ${userProfile?.state || 'Unknown'}
      - First-time voter: ${userProfile?.firstTimeVoter ? 'Yes' : 'No'}
      - Preferred Language: ${language === 'hinglish' ? 'Hinglish (Mix of Hindi and English)' : 'English'}
      
      User Message: "${message}"
      
      Instructions:
      1. Structure the response strictly in the following format if the user asks about the voting process or day:
         For each step include:
         * Step Number
         * Step Title
         * What Happens (simple explanation)
         * What You Should Do (clear actions)
         * What to Carry (if applicable)
         * Tips (helpful advice)
         * Common Mistakes (warnings)
      2. Keep language simple, friendly, beginner-focused, and avoid legal jargon.
      3. Personalize the explanation based on user details (e.g., explain gently if first-time voter, mention state if relevant).
      4. If simulating the voting day, cover the full voting journey in India:
         Step 1: Arriving at the polling booth
         Step 2: Identity verification
         Step 3: Ink marking
         Step 4: Entering voting compartment
         Step 5: Casting vote using EVM
         Step 6: Exiting the polling station
      5. After all steps, include:
         * Final Summary: "You are now ready to vote"
         * Confidence Boost: Reassure user they can do it easily
      6. Output MUST be clean and structured like:
         Step 1: Title
         What Happens:
         What You Should Do:
         What to Carry:
         Tips:
         Common Mistakes:
         (Repeat for all steps)
      7. Keep each step concise (max 5–6 lines per section). Do NOT generate unnecessary long paragraphs. Make it feel like a guided experience.
      8. Respond in the user's preferred language.
      9. Return a JSON object with two fields: 'response' (the formatted markdown text reply) and 'suggestions' (array of 2-3 short follow-up questions).
      
      Output format: 
      {"response": "your formatted markdown text response here", "suggestions": ["suggestion 1", "suggestion 2"]}
    `;

    const modelsToTry = [
      'gemini-flash-lite-latest', 
      'gemini-2.0-flash-lite-001',
      'gemini-pro-latest', 
      'gemini-2.5-pro', 
      'gemini-flash-latest', 
      'gemini-2.5-flash'
    ];
    let text = null;
    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }]
            })
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          lastError = data.error;
          console.warn(`Model ${model} failed:`, data.error?.message || "Unknown API error");
          continue; // Try the next model
        }

        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (responseText) {
          text = responseText;
          console.log(`Successfully generated chat using ${model}`);
          break; // Success! Exit the fallback loop
        }
      } catch (err) {
        lastError = err;
        console.warn(`Fetch error for ${model}:`, err.message);
        continue;
      }
    }

    if (!text) {
      console.error("All fallback models failed. Last error:", lastError);
      return res.status(503).json({ error: lastError?.message || "All Gemini models are currently unavailable" });
    }
    
    try {
      // Parse JSON from text response
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (e) {
      // Fallback if model doesn't return perfect JSON
      res.json({
        response: text,
        suggestions: ["What's next?", "Can you explain that again?"]
      });
    }

  } catch (error) {
    console.error("Error generating chat response:", error.message || error);
    res.status(500).json({ error: "Failed to generate response" });
  }
};
