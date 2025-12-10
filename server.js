const express = require('express');
const path = require('path');
const app = express();

// Раздача статических файлов (index.html, js, css)
app.use(express.static(path.join(__dirname)));

// Любой GET → отдаём index.html (на случай SPA)
app.get(new RegExp('^/(.*)$'), (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'), (err) => {
        if (err) {
            console.error(err);
            res.status(404).send("File not found");
        }
    });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Frontend server running at http://localhost:${PORT}`);
});