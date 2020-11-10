const { query } = require('../db');

const router = require('express').Router();

router.get('/', async (req, res) => {
    if (!req.query.q) return res.status(400).json({error: 'The q query parameter is required'});
    const limit = Math.min(req.query.limit || 20, 1000);
    const offset = req.query.offset || 0;
    const { rows } = await query(`
        SELECT 
            l.id, l.file_num, l.type, l.status, l.introduced_on, l.finalized_on, l.name, l.title, l.details_url,
            
            json_agg(p) FILTER (WHERE p.id IS NOT NULL) "legislation_sponsors",
            
            (SELECT json_agg(lh) FROM (
                SELECT 
                    lh.id, lh.result, lh.action, lh.action_by, lh.action_url, lh.date,
                    json_agg(json_build_object(
                        'vote', row_to_json(v),
                        'person', row_to_json(p)
                    )) FILTER (WHERE v.id IS NOT NULL) "votes"
                FROM legislation_history lh
                LEFT JOIN (
                    SELECT id, vote, legislation_history_id, person_id
                    FROM votes
                ) v ON v.legislation_history_id = lh.id
                LEFT JOIN (
                    SELECT id, name
                    FROM people
                ) p ON p.id = v.person_id
                WHERE lh.legislation_file_num = l.file_num
                GROUP BY lh.id	
                ORDER BY lh.date DESC
            ) lh) "legislation_histories"
        FROM legislation l
        LEFT JOIN legislation_sponsors ls ON ls.legislation_file_num = l.file_num
        LEFT JOIN (
            SELECT id, name
            FROM people
        ) p ON ls.person_id = p.id
        WHERE l.text_index @@ plainto_tsquery('english', $1)
        GROUP BY l.id
        ORDER BY l.introduced_on DESC
        LIMIT $2
        OFFSET $3
    `, [req.query.q, limit, offset]);
    res.json({rows, sources: [
        'https://sfgov.legistar.com/Legislation.aspx'
    ]})
});

router.get('/outcomes', async (req, res) => {
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
    res.json({rows, sources: [
        'https://sfgov.legistar.com/Legislation.aspx'
    ]});
});

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
    res.json({rows, sources: [
        'https://sfgov.legistar.com/Legislation.aspx'
    ]})
});

module.exports = router;