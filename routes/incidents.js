const { query, } = require('../db');

const router = require('express').Router();

router.get('/annual-summary', async (req, res) => {
    let categories = req.query.categories;
    if (!categories) return res.status(400).json({error: 'The categories query parameter is required'});

    const { rows } = await query(`
        SELECT 
            incident_category, incident_year, incidents, percent_cited_or_arrested
        FROM incident_category_by_year
        WHERE 
            incident_category = ANY($1)
            AND incident_year < extract(year from now())
        ORDER BY 1, 2
    `, [categories.split(',')], `incident-categories-${categories}`);

    res.json({rows, sources: [
        'https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-2018-to-Present/wg3w-h783',
        'https://data.sfgov.org/Public-Safety/Police-Department-Incident-Reports-Historical-2003/tmnf-yvry'
    ]});
})

module.exports = router;