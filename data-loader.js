/**
 * Initiative Hub — Data Loader
 * Fetches and parses the CSV file.
 */

const DataLoader = (function () {
    'use strict';

    const CACHE_KEY = 'initiativeHub_data';
    const CACHE_TS_KEY = 'initiativeHub_ts';

    function getCached(minutes) {
        if (minutes <= 0) return null;
        try {
            const ts = localStorage.getItem(CACHE_TS_KEY);
            if (!ts) return null;
            if ((Date.now() - parseInt(ts, 10)) / 60000 > minutes) {
                localStorage.removeItem(CACHE_KEY);
                localStorage.removeItem(CACHE_TS_KEY);
                return null;
            }
            const data = localStorage.getItem(CACHE_KEY);
            return data ? JSON.parse(data) : null;
        } catch (e) { return null; }
    }

    function setCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(data));
            localStorage.setItem(CACHE_TS_KEY, Date.now().toString());
        } catch (e) { /* ignore */ }
    }

    function parseCSV(csvText) {
        const results = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: h => h.trim().replace(/^\uFEFF/, '')
        });

        return results.data.map((row, index) => ({
            id: index,
            category: (row.Category || row.category || '').trim(),
            title: (row['Título'] || row['Title'] || row['title'] || '').trim(),
            lead: (row.Lead || row.lead || row.Owner || '').trim(),
            description: (row.Description || row.description || '').trim(),
            link: (row.Link || row.link || row.URL || '').trim()
        })).filter(item => item.title.length > 0);
    }

    async function load(config) {
        const cacheMins = config.dataSource.cacheDurationMinutes || 0;

        // Check cache
        const cached = getCached(cacheMins);
        if (cached) return { data: cached, source: 'cache' };

        // Fetch CSV
        const response = await fetch(config.dataSource.localFile);
        if (!response.ok) {
            throw new Error(`Failed to load CSV: ${response.status}`);
        }

        const csvText = await response.text();
        const data = parseCSV(csvText);

        // Cache
        if (cacheMins > 0 && data.length > 0) setCache(data);

        return { data: data, source: 'csv' };
    }

    return {
        load: load,
        clearCache: function () {
            localStorage.removeItem(CACHE_KEY);
            localStorage.removeItem(CACHE_TS_KEY);
        }
    };
})();
