# Lezzet Sepeti - Full Stack Proje

Bu proje, modern bir yemek siparis web sitesi odevi icin hazirlanmistir.

## Teknolojiler

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Veritabani: SQLite

## Ozellikler

- Yemek listeleme ve sepete ekleme
- Siparis olusturma ve onaylama
- 1-5 puanla yorum ekleme
- Yapay zeka mantikli yemek onerisi (populer 3 yemek icinden rastgele)

## Kurulum

1. Node.js kurulu degilse indirip kurun: [https://nodejs.org](https://nodejs.org)
2. Proje klasorunde terminal acin.
3. Bagimliliklari yukleyin:

```bash
npm install
```

4. Sunucuyu baslatin:

```bash
npm start
```

> Not: Projenin Render veya benzeri Linux tabanlı ortamlarda sorunsuz calismasi icin Node.js 18.x veya 20.x kullanmaniz onerilir.

5. Tarayicidan acin:

```text
http://localhost:3000
```

## API Uclari

- `GET /api/foods` -> aktif yemek listesi
- `GET /api/reviews` -> yorumlar
- `POST /api/reviews` -> yeni yorum
- `GET /api/suggestion` -> yemek onerisi
- `POST /api/orders` -> siparis olusturma
