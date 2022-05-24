require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const url = require('url');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('data/hs.db');

const { removePaywall } = require('./hs');

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

const getPasteUrl = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT pasteUrl FROM articles WHERE hsId=?`, id, (err, row) => {
            if (err)
                reject(err);
            resolve(row);
        });
    });
}

const getArticleRequests = (id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT requests FROM articles WHERE hsId=?`, id, (err, row) => {
            if (err)
                reject(err);
            resolve(row);
        });
    });
}


db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS articles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        requests INTEGER DEFAULT 1,
        hsId INTEGER,
        url TEXT,
        pasteUrl TEXT,
        telegramChatId INTEGER
    );   
    `);
});

bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Poistan sen v*tuttavan maksumuurin hesarin uutisista helposti 🏴‍☠️. Käyttö:\n\n- Privachatissä lähetät linkin ja vastaan artikkelin tekstidumpilla\n- Ryhmissä voit käyttää komentoa /unpaywall <hesarin linkki>\n\nHyviä lukuhetkiä!");
});

bot.onText(/\/unpaywall (.+)/, async(msg, match) => {
    const chatId = msg.chat.id;

    hsUrl = url.parse(match[1], true);

    if (hsUrl.host == null)
        return;
    if (!hsUrl.host.includes('hs.fi'))
        return;

    const id = hsUrl.pathname.replace(/[^0-9]/g, '');

    const pasteUrl = await getPasteUrl(id);
    if (pasteUrl != undefined && "pasteUrl" in pasteUrl) {
        db.run(`UPDATE articles SET requests = requests + 1 WHERE hsId=?`, id);
        const times = await getArticleRequests(id);
        return bot.sendMessage(chatId, `Artikkelista on jo poistettu maksumuuri (artikkelia pyydetty ${times.requests} kertaa): ${pasteUrl.pasteUrl}`);
    }

    const pastebin = await removePaywall(id);

    if (pastebin == 'paid')
        return bot.sendMessage(chatId, `Eihän siellä mitään maksumuuria ole senkin höpsö :P`);

    bot.sendMessage(chatId, `Maksumuuri heivattu hemmettiin: ${pastebin}`);
    db.run(`INSERT INTO articles (hsId, url, pasteUrl, telegramChatId) VALUES (?, ?, ?, ?)`, [id, msg.text, pastebin, chatId]);
});

bot.on('message', async(msg) => {
    const chatId = msg.chat.id;

    if (msg.chat.type != 'private')
        return;
    if (msg.text.includes('/start') || msg.text.includes('/unpaywall'))
        return;

    hsUrl = url.parse(msg.text, true);

    if (hsUrl.host == null)
        return;
    if (!hsUrl.host.includes('hs.fi'))
        return;

    const id = hsUrl.pathname.replace(/[^0-9]/g, '');

    const pasteUrl = await getPasteUrl(id);
    if (pasteUrl != undefined && "pasteUrl" in pasteUrl) {
        db.run(`UPDATE articles SET requests = requests + 1 WHERE hsId=?`, id);
        const times = await getArticleRequests(id);
        return bot.sendMessage(chatId, `Artikkelista on jo poistettu maksumuuri (artikkelia pyydetty ${times.requests} kertaa): ${pasteUrl.pasteUrl}`);
    }

    const pastebin = await removePaywall(id);

    if (pastebin == 'paid')
        return bot.sendMessage(chatId, `Eihän siellä mitään maksumuuria ole senkin höpsö :P`);

    bot.sendMessage(chatId, `Maksumuuri heivattu hemmettiin: ${pastebin}`);
    db.run(`INSERT INTO articles (hsId, url, pasteUrl, telegramChatId) VALUES (?, ?, ?, ?)`, [id, msg.text, pastebin, chatId]);
});