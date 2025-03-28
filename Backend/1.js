const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ = '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';

const model_id = 'llama-3.1-8b-instant';
const api='sk_53f0213bc36b40ea44d11e06352209ce19f7a6585b10c67b';
const id='21m00Tcm4TlvDq8ikWAM'
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
        const audio = await convertTextToSpeech(story);
        if (!audio) {
            return res.status(500).json({ error: 'Failed to generate audio' });
        }

        res.json({ story, audio });
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


async function convertTextToSpeech(text) {
    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': api,
            },
            body: JSON.stringify({ text })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        
        const audioBuffer = await response.arrayBuffer();

        return audioBuffer;
    } catch (error) {
        console.error('Error in convertTextToSpeech:', error);
        throw error;
    }
};



const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
