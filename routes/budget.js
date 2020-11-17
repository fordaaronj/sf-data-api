const { query, } = require('../db');

const router = require('express').Router();

router.get('/summary', async (req, res) => {
    const { rows } = await query(`
        SELECT fiscal_year, round(sum(budget)::float / 1000000) "budget_millions"
        FROM budget
        WHERE 
            revenue_or_spending = 'Spending'
            AND fiscal_year <= extract(year from now()) + 1
            AND department NOT IN (
                'AIR Airport Commission',
                'MTA Municipal Transprtn Agncy',
                'PRT Port'
            )
        GROUP BY 1
        ORDER BY 1;
    `, undefined, 'annual-budget');

    res.json({rows, sources: [
        'https://data.sfgov.org/City-Management-and-Ethics/Budget/xdgd-c79v'
    ]});
})

router.get('/per-person', async (req, res) => {
    const { rows } = await query(`
        SELECT 
            b.fiscal_year "year", 
            p.population, 
            sum(budget) "budget", 
            sum(budget)::float / p.population "budget_per_person"
        FROM budget b
        JOIN population p ON (b.fiscal_year = extract(year from p."date"))
        WHERE 
            b.revenue_or_spending = 'Spending'
            AND p.metric = 'TOT_POP'
            AND p.age_group = 'Total'
        GROUP BY 1, 2
        ORDER BY 1;
    `, undefined, 'budget-per-person');
    res.json({rows, sources: [
        'https://data.sfgov.org/City-Management-and-Ethics/Budget/xdgd-c79v',
        'https://www.census.gov/programs-surveys/popest.html'
    ]});
});

router.get('/employees', async (req, res) => {
    const { rows } = await query(`
        SELECT year, count(DISTINCT employee_identifier) "employees"
        FROM employees
        WHERE year_type = 'Calendar'
        GROUP BY 1;
    `, undefined, 'number-employees');
    res.json({rows, sources: [
        'https://data.sfgov.org/City-Management-and-Ethics/Employee-Compensation/88g8-5mnd'
    ]});
});

router.get('/revenue', async (req, res) => {
    if (!req.query.category) return res.status(400).json({error: 'The category query parameter is required'}); 
    
    const { rows } = await query(`
        SELECT fiscal_year, round(sum(budget)::float / 1000000) "revenue_millions"
        FROM budget 
        WHERE 
            revenue_or_spending = 'Revenue'
            AND "character" = $1
            AND fiscal_year <= extract(year from now())
        GROUP BY 1
        ORDER BY 1
    `, [req.query.category], `budget-${req.query.category}`);
    res.json({rows, sources: [
        'https://data.sfgov.org/City-Management-and-Ethics/Budget/xdgd-c79v'
    ]});
})

router.get('/homeless', async (req, res) => {
    const { rows } = await query(`
        SELECT fiscal_year "year", round(sum(budget)::float / 1000000) "budget_millions"
        FROM budget
        WHERE 
            revenue_or_spending = 'Spending'
            AND (
                organization_group ILIKE '%homeless%'
                OR department ILIKE '%homeless%'
                OR program ILIKE '%homeless%'
            )
            AND fiscal_year <= extract(year from now())
        GROUP BY 1
        ORDER BY 1;
    `, undefined, 'budget-homeless');
    res.json({rows, sources: [
        'https://data.sfgov.org/City-Management-and-Ethics/Budget/xdgd-c79v'
    ]});
});

module.exports = router;