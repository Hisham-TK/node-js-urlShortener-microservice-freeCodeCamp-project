require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const generateUuid = require('uuid').v4;

const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

const SHORTEN_URLS = new Map();

// Shorten URL if valid
app.post('/api/shorturl', function (req, res) {
  // Validate URL: parse it with URL class
  const parsedUrl = new URL(req.body.url);

  // Validate URL: DNS lookup
  dns.lookup(parsedUrl.hostname, (err, address, _family) => {
    // If invalid URL
    if (err || !address) return res.json({ error: 'invalid url' });

    // Generate unique shorten id
    const shortenUrlId = generateUuid().slice(0, 8);

    // Store shorten in-memory
    SHORTEN_URLS.set(shortenUrlId, parsedUrl.href);

    // Reply to service
    return res.json({ original_url: parsedUrl.href, short_url: shortenUrlId });
  });
});

// Redirect to shorten URL if exists
app.get('/api/shorturl/:shortenId', function (req, res) {
  const shortenUrl = SHORTEN_URLS.get(req.params.shortenId);

  return res.redirect(shortenUrl);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
