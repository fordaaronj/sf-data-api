const { query, } = require('../db');

const router = require('express').Router();

router.get('/votes/yes', async (req, res) => {
    const { rows } = await query(`
        SELECT 
            extract(year from lh."date") "year",
            (count(*) FILTER (WHERE v.vote = 'Aye'))::float / count(*) "percent_aye"
        FROM votes v 
        JOIN legislation_history lh ON v.legislation_history_id = lh.id
        WHERE
            extract(year from lh."date") >= 2000
        GROUP BY 1
        ORDER BY 1
    `, undefined, 'votes-yes');
    res.json(rows)
});

router.get('/legislation/outcomes', async (req, res) => {
    const { rows } = await query(`
        SELECT 
            extract(year from introduced_on) "year",
            (count(*) FILTER (WHERE status IN ('Passed', 'Filed')))::float / count(*) "percent_passed"
        FROM legislation
        WHERE 
            finalized_on IS NOT NULL
            AND introduced_on IS NOT NULL
            AND extract(year from introduced_on) >= 2000
            AND introduced_on <= now() - interval '6 months'
        GROUP BY 1
        ORDER BY 1
    `, undefined, 'legislation-outcomes');
    res.json(rows);
})

module.exports = router;