// api/ocr.js (Mode Detektif)
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'API Key belum disetting.' });

    try {
        // Cek model apa saja yang tersedia untuk kunci ini
        const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const listData = await listResponse.json();
        
        if (!listResponse.ok) {
            return res.status(500).json({ error: `Gagal list model: ${listData.error?.message || 'Unknown'}` });
        }

        const availableModels = listData.models.map(m => m.name).join(', ');
        return res.status(500).json({ error: `Kunci Anda hanya mendukung model ini: ${availableModels}. Silakan pilih salah satu untuk saya pasang.` });

    } catch (error) {
        res.status(500).json({ error: 'Kesalahan Detektif: ' + error.message });
    }
}
