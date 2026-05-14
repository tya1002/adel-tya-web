// api/ocr.js (Vercel Serverless Function)
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { image } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API Key Gemini belum disetting di Vercel.' });
    }

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: "Extract data from this handwritten invoice table. Return ONLY a valid JSON array of objects with keys: 'name', 'kilo', and 'modal'. If 'modal' is missing, leave it empty. Format numbers as decimals. Only return the JSON, no markdown tags." },
                        { inline_data: { mime_type: "image/jpeg", data: image.split(',')[1] } }
                    ]
                }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(500).json({ error: `Google API Error: ${data.error?.message || 'Unknown Error'}` });
        }

        if (!data.candidates || !data.candidates[0]) {
            return res.status(500).json({ error: 'AI tidak memberikan jawaban. Coba foto lebih jelas.' });
        }

        const textResponse = data.candidates[0].content.parts[0].text;
        const jsonString = textResponse.replace(/```json|```/g, '').trim();
        const result = JSON.parse(jsonString);

        res.status(200).json(result);
    } catch (error) {
        console.error("Gemini Error:", error);
        res.status(500).json({ error: 'Terjadi kesalahan sistem: ' + error.message });
    }
}
