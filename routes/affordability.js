const { query, } = require('../db');

const router = require('express').Router();

router.get('/housing', async (req, res) => {
    const { rows } = await query(`
        SELECT extract(year from date) "year", round(avg(percent_households_afford_median_home)) "value"
        FROM housing_affordability
        WHERE date >= '2010-01-01'
        GROUP BY 1
        ORDER BY 1
    `, undefined, `housing-affordability`);

    res.json({rows, sources: [
        'https://www.car.org/marketdata/data/haitraditional'
    ]});
})

module.exports = router;