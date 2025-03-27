const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ = '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';
// const ElevenLabs= 'sk_dd030de76fe56c336790afaad64452effc44375284387ef3';
// const ElevenLabs_voice = 'pNInz6obpgDQGcFmaJgB'; 
const model_id = 'llama-3.1-8b-instant';

const groq = new Groq({ apiKey: GROQ });

app.post('/generate-story', async (req, res) => {
    const { prompt } = req.body;
    if (!prompt || prompt.trim() === '') {
        return res.status(400).json({ error: 'Prompt is required' });
    }

    try {
        const story = await getLlamaResponse(prompt);
        if (!story) {
            return res.status(500).json({ error: 'Failed to generate story' });
        }
        // const audioBuffer = await convertTextToSpeech(story);
        // if (!audioBuffer) {
        //     return res.status(500).json({ error: 'Failed to generate audio' });
        // }

        res.json({ story });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

async function getLlamaResponse(prompt) {
    try {
        const speak = await groq.chat.completions.create({
            model: model_id,
            messages: [
                { role: "system", content: "You're an AI story teller. Response should be in JSON format: { \"story\": \"\" }" },
                { role: "user", content: prompt }
            ],
            temperature: 0.5,
            max_completion_tokens: 1024,
            top_p: 1,
            stream: false,
            response_format: { type: "json_object" }
        });

        const response = speak.choices[0]?.message?.content;
        if (!response) {
            console.error("Empty response from Groq API:", speak);
            return null;
        }

        const parsed = JSON.parse(response);
        return parsed.story || null;
    } catch (error) {
        console.error("Error in getLlamaResponse:", error);
        return null;
    }
}

// async function convertTextToSpeech(text) {
//     try {
//         const response = await fetch(`https://api.elevenlabs.io/v1/tts/${ElevenLabs_voice}`, {
//             method: 'POST',
//             headers: {
//                 'Accept': 'audio/mpeg',
//                 'Content-Type': 'application/json',
//                 'xi-api-key': ElevenLabs
//             },
//             body: JSON.stringify({
//                 text: text,
//                 model_id: "eleven_multilingual_v2",
//                 voice_settings: {
//                     stability: 0.5,
//                     similarity_boost: 0.8
//                 }
//             })
//         });

//         if (!response.ok) {
//             throw new Error(`ElevenLabs API error: ${response.statusText}`);
//         }

//         return await response.buffer(); 
//     } catch (error) {
//         console.error("Error in convertTextToSpeech:", error);
//         return null;
//     }
// }

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
