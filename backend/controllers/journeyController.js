
import dotenv from 'dotenv';
dotenv.config();

export const generateJourney = async (req, res) => {
  try {
    const { age, state, firstTimeVoter, language } = req.body;
    
    // Fallback if API key is not configured (mock response)
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.json({
        timeline: [
          {
            title: "Check Voter Registration",
            description: `Since you live in ${state}, start by verifying if your name is on the electoral roll.`,
            status: "pending",
            date: "Anytime before election notification",
            link: "https://electoralsearch.eci.gov.in/"
          },
          {
            title: "Apply for Voter ID",
            description: firstTimeVoter ? "As a first-time voter, you need to fill Form 6 to register as a new voter." : "Ensure your details on the voter ID are up to date.",
            status: "pending",
            date: "ASAP",
            link: "https://voters.eci.gov.in/"
          },
          {
            title: "Verify Polling Booth",
            description: "Locate your assigned polling booth online before the voting day.",
            status: "pending",
            date: "1-2 weeks before election",
            link: "https://electoralsearch.eci.gov.in/"
          },
          {
            title: "Voting Day Process",
            description: "Go to the booth, show your ID, get inked, and press the button on the EVM.",
            status: "pending",
            date: "Election Day",
            link: ""
          }
        ]
      });
    }

    const prompt = `
      Create a personalized election journey timeline for a user in India.
      User Profile:
      - Age: ${age}
      - State: ${state}
      - First-time voter: ${firstTimeVoter ? 'Yes' : 'No'}
      - Preferred Language: ${language === 'hinglish' ? 'Hinglish (Hindi written in English script + English)' : 'English'}
      
      Generate a step-by-step timeline of election-related events from registration to voting day. 
      Keep explanations simple, avoiding legal jargon.
      If there is an official Indian government website (like https://voters.eci.gov.in or https://electoralsearch.eci.gov.in) where the user can complete the step or get more info, provide it in the 'link' field. Otherwise leave the link empty.
      
      Return ONLY a JSON object in this format:
      {
        "timeline": [
          {
            "title": "Step Title",
            "description": "Simple description of what to do",
            "status": "pending",
            "date": "When this should happen (e.g. ASAP, Election Day)",
            "link": "https://..."
          }
        ]
      }
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
          console.log(`Successfully generated journey using ${model}`);
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
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      res.json(parsed);
    } catch (e) {
      res.status(500).json({ error: "Failed to parse timeline from AI" });
    }

  } catch (error) {
    console.error("Error generating journey:", error.message || error);
    res.status(500).json({ error: "Failed to generate journey" });
  }
};
