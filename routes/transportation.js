const { query, } = require('../db');

const router = require('express').Router();

router.get('/share', async (req, res) => {
    const { rows } = await query(`
        SELECT 
            (CASE 
                WHEN mode IN ('Drove alone', 'Drove with others') THEN 'Drove'
                WHEN mode IN ('TNC', 'Taxi') THEN 'Carshare/Taxi'
                ELSE mode
            END) "mode",
            fiscal_year, 
            sum(percent_share)::integer "percent_share"

        FROM transportation_share
        WHERE 
            fiscal_year >= 2013
        GROUP BY 1, 2
        ORDER BY 1, 2
    `, undefined, `transportation-share`);

    res.json({rows, sources: [
        'https://www.sfmta.com/reports/sustainable-transportation-mode-share'
    ]});
})

module.exports = router;