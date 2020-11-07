const { query } = require('../db');

const router = require('express').Router();

router.get('/', async (req, res) => {
    if (!req.query.q) return res.status(400).json({error: 'The q query parameter is required'});
    const limit = Math.min(req.query.limit || 20, 1000);
    const offset = req.query.offset || 0;
    const { rows } = await query(`
        SELECT 
            transcripts.id, text, speaker_title, speaker_name, text, start_time,
            row_to_json(meetings) "meeting"
        FROM transcripts
        JOIN (
            SELECT id, committee, time, transcript_url
            FROM meetings
        ) meetings ON transcripts.meeting_id = meetings.id
        WHERE transcripts.text_index @@ plainto_tsquery('english', $1)
        ORDER BY meetings.time DESC
        LIMIT $2
        OFFSET $3
        `, [req.query.q, limit, offset]);
    res.json(rows)
});

router.get('/agg/years', async (req, res) => {
    if (!req.query.q) return res.status(400).json({error: 'The q query parameter is required'})
    const { rows } = await query(`
        SELECT 
            extract(year from meetings.time)::text "year",
            count(*)::integer "num"
        FROM transcripts
        JOIN meetings ON transcripts.meeting_id = meetings.id
        WHERE transcripts.text_index @@ plainto_tsquery('english', $1)
        GROUP BY 1
        ORDER BY 1
    `, [req.query.q]);
    res.json(rows)
});

router.get('/agg/speakers', async (req, res) => {
    if (!req.query.q) return res.status(400).json({error: 'The q query parameter is required'})
    const { rows } = await query(`
        SELECT 
            speaker_name,
            count(*)::integer "num"
        FROM transcripts
        WHERE 
            text_index @@ plainto_tsquery('english', $1)
            AND speaker_name IS NOT NULL
        GROUP BY 1
        ORDER BY 2 DESC
    `, [req.query.q]);
    res.json(rows)
});

module.exports = router;