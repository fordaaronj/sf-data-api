// Setup
require('dotenv').config();
const express = require('express');
require('express-async-errors');
const app = express();
app.use(require('cors')());

// Routes
const transcripts = require('./routes/transcripts');
const legislation = require('./routes/legislation');
const dashboard = require('./routes/dashboard');

app.get('/', (req, res) => {
	res.send('Hi')
});
app.use('/api/transcripts', transcripts);
app.use('/api/legislation', legislation);
app.use('/api/dashboard', dashboard);

// Run
if (process.env.NODE_ENV == 'development') app.listen(process.env.PORT || 3000);

module.exports = app;