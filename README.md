# HS Unpaywall

Halusin pystyä jakamaan Hesarin artikkelit ilman maksumuuria ystävilleni. Helsingin Sanomilla voi kutsua API-päätepisteestä artikkelin sisällön ilman tiliä (pätee maksumuurillisiinkin artikkeleihin).

Botin tavoittaa Telegramissa: https://t.me/hswallBot

## Kehittäminen

Oletettavasti mitään suurta bottiin ei tule. Yksinkertainen on kaunista. Tuotantoversio löytyy Docker-kontista, mutta kehitys tapahtuu ilman Dockeria.

Projekti vaatii paketteja, jotka voi asentaa `npm install` komennolla. 

Projektin kansiossa pelkän komennon: `node .` (tai `nodemon .`) ajaminen käynnistää botin.

Muista katsoa tiedostosta [.env.example](.env.example) tarpeelliset muuttujat. 

## Tuotanto

`data`-kansiossa säilytetään tietokantatiedostoa. Käytössä on sqlite3. 

Muista katsoa tiedostosta [.env.example](.env.example) tarpeelliset muuttujat. 

Projektin saa päälle docker-composella: `docker-compose up -d`.