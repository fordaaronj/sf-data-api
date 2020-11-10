// Setup
require('dotenv').config();
const express = require('express');
require('express-async-errors');
const app = express();
app.use(require('cors')());

// Routes
app.get('/', (req, res) => {
	res.send('Hi')
});
app.use('/api/311', require('./routes/311'));
app.use('/api/budget', require('./routes/budget'));
app.use('/api/legislation', require('./routes/legislation'));
app.use('/api/transcripts', require('./routes/transcripts'));

// Run
if (process.env.NODE_ENV == 'development') app.listen(process.env.PORT || 3000);

module.exports = app;