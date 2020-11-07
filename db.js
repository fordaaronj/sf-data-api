const { Pool } = require('pg');
const NodeCache = require('node-cache');

const cache = new NodeCache();

const connectionString = process.env.DATABASE_URL;

const pool = new Pool({ connectionString });

module.exports = {
    query: (query, params, cacheKey, cacheExpirationSeconds = 60 * 60) => {
        let results;
        if (cacheKey) results = cache.get(cacheKey);
        if (!results) results = pool.query(query, params);
        if (cacheKey) cache.set(cacheKey, results, cacheExpirationSeconds);
        return results;
    }
}

