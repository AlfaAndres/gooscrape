const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/scrape', async (req, res) => {
    const fce = req.body.fce;

    if (!fce) {
        res.status(400).send('Chybí dotaz');
        return;
    }

    try {
        const url = "https://www.google.com/search?q=" + encodeURIComponent(fce);
        const response = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(response.data);
        const results = [];
        $("div.tF2Cxc").each(function() {
            const title = $(this).find("h3").text();
            const link = $(this).find("a").attr("href");
            const snippet = $(this).find(".VwiC3b").text();
            if (title && link) {
                results.push({ title: title, link: link, snippet: snippet });
            }
        });

        res.json(results);
    } catch (error) {
        console.error("Chyba při scrapování:", error);
        res.status(500).send("Chyba při scrapování");
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server běží na http://localhost:${PORT}`);
});
