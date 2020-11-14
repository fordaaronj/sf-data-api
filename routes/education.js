const { query, } = require('../db');

const router = require('express').Router();

router.get('/test-results', async (req, res) => {
    let subject = req.query.subject;
    if (!subject) return res.status(400).json({error: 'The subject query parameter is required'});

    const { rows } = await query(`
        SELECT 
            year, race, subject, percent_met_or_exceeded
        FROM test_results
        WHERE subject = $1
        ORDER BY 1, 2, 3
    `, [subject], `test-results-${subject}`);

    res.json({rows, sources: [
        'http://caaspp.edsource.org/sbac/san-francisco-unified-38684780000000'
    ]});
})

module.exports = router;