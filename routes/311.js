const { query, } = require('../db');

const router = require('express').Router();

router.get('/summary', async (req, res) => {
    let categories = req.query.categories;
    if (!categories) return res.status(400).json({error: 'The categories query parameter is required'});
    categories = categories.split(',').sort();

    const { rows } = await query(`
        SELECT opened_year "year", sum(total) "cases"
        FROM three_one_one_annual_summary
        WHERE 
            category = ANY($1)
            AND opened_year < (SELECT max(opened_year) FROM three_one_one_annual_summary)
        GROUP BY 1
        ORDER BY 1;
    `, [categories], `311-${categories.join(',')}`);

    res.json({rows, sources: [
        'https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6'
    ]});
})

module.exports = router;