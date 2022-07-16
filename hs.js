const axios = require('axios').default;

exports.removePaywall = async(id) => {
    let isnum = /^\d+$/.test(id);

    if (!isnum)
        return;

    console.log(`Poistetaan maksumuuria: ${id}`);

    const response = await axios.get(`https://www.hs.fi/api/paid-article/hs/${id}`, {
        headers: {
            "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "fi-FI,fi;q=0.8,en-US;q=0.5,en;q=0.3",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "X-Forwarded-For": "66.249.66.1",
            "Sec-GPC": "1",
            "Pragma": "no-cache",
            "Cache-Control": "no-cache"
        }
    });

    if (!response.data.analyticsMetadata.paywallStatus.includes('paid'))
        return 'paid';

    text = "";

    response.data.splitBody.forEach(piece => {
        if (piece.type !== 'paragraph')
            return;
        piece.crumbs.forEach(crumb => {
            text += crumb.content;
        });

        text += "\n\n"
    });

    const pastebin = await axios.post('https://pastebin.fi/new', {
        title: `Helsingin Sanomat - ${response.data.analyticsMetadata.pageTitle} - ${id} - Maksumuuri poistettu`,
        paste: text,
    });

    return pastebin.request.res.responseUrl;
}
