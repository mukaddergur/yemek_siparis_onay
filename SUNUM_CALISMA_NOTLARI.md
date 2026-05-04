# Lezzet Sepeti - Detayli Sunum ve Savunma Notlari

Bu dokuman, projeyi hocaya teknik olarak savunmak icin hazirlandi.  
Icerikte dosya bazli aciklama, kod ornekleri, akis mantigi, AI alani, guvenlik notlari ve olasi soru-cevaplar bulunur.

---

## 1) Proje Mimarisi (Buyuk Resim)

Proje 3 katmandan olusur:

- Frontend: `index.html`, `style.css`, `script.js`
- Backend: `server.js` (Node.js + Express)
- Veritabani: `database.sql` ile olusan `yemeksepeti.db` (SQLite)

Calisma sirasi:

1. `npm start` calisir (`node server.js`)
2. Server ayaga kalkar, DB kontrol edilir/olusturulur
3. Tarayiciya `index.html` + `style.css` + `script.js` verilir
4. Frontend API cagirip verileri ceker
5. Kategori secimi -> urunler -> sepet -> siparis/yorum akisi ilerler

---

## 2) package.json (Projenin Kimlik Karti)

Bu dosya Node.js'e proje hakkinda talimat verir.

Onemli kisimlar:

- `"main": "server.js"` -> ana giris dosyasi
- `"scripts": { "start": "node server.js" }` -> `npm start` kisayolu
- `"dependencies"`:
  - `express`: web sunucusu
  - `sqlite3`: veritabani surucusu

Neden onemli?

- Gelistirme/kurulum standartlasir
- Tek komutla calistirma saglar

---

## 3) database.sql (Veritabani Tasarimi)

Verilerin nerede ve hangi kurallarla saklanacagini tanimlar.

### Tablolar

- `users`
- `foods`
- `orders`
- `order_items`
- `reviews`

### Iliskiler

- `FOREIGN KEY` ile baglanti:
  - `orders.user_id -> users.id`
  - `order_items.order_id -> orders.id`
  - `order_items.food_id -> foods.id`
  - `reviews.user_id -> users.id`
  - `reviews.food_id -> foods.id`

### Veri kalitesi kurallari

- `CHECK (price >= 0)`
- `CHECK (rating BETWEEN 1 AND 5)`
- `CHECK (quantity > 0)`
- `status` degerleri sinirli (`pending`, `confirmed`, ...)

### Performans

- `CREATE INDEX` satirlariyla temel sorgular hizlandirilir.

---

## 4) server.js (Backend - API ve Is Mantigi)

Backend'in gorevi:

- Frontend dosyalarini sunmak
- API endpoint'lerini yonetmek
- Veritabanina okuyup yazmak

### Temel kurulum

```js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname)));
```

### DB helper fonksiyonlari neden var?

`sqlite3` callback tabanli oldugu icin `run/get/all/exec` helper'lariyla Promise yapisina gecildi.  
Bu sayede async/await ile daha okunur ve kontrollu kod yazildi.

### initDb() neden kritik?

- `database.sql` dosyasini calistirir
- `foods` tablosu kolon kontrolu yapar
- `MENU_CATALOG` verisini DB'ye ekler/gunceller (seed)
- artik katalogda olmayan urunleri pasifler (`is_active = 0`)

### API endpoint'leri

- `GET /api/foods` -> aktif urunleri kategori sirasiyla getirir
- `GET /api/reviews` -> yorumlari yemek adlariyla birlestirip getirir
- `POST /api/reviews` -> yorum ekler (validasyon var)
- `GET /api/suggestion` -> onerilen urun getirir
- `POST /api/orders` -> siparisi kaydeder

### Siparis guvenligi (onemli savunma noktasi)

Toplam tutar frontend'den oldugu gibi alinmaz. Backend tekrar hesaplar:

```js
for (const item of items) {
  const quantity = Number(item.quantity || 1);
  const foodId = Number(item.foodId);
  const food = await get("SELECT id, price FROM foods WHERE id = ? AND is_active = 1", [foodId]);
  total += food.price * quantity;
}
```

Bu, manipule edilmis istekleri azaltmak icin onemlidir.

---

## 5) index.html (Yapi ve Semantik Iskelet)

`index.html` gorunumun "iskeletini" kurar.

### Baslica semantik bloklar

- `<header>` -> ust baslik alani
- `<main>` -> ana icerik
- `<section id="foods-section">` -> urun/kategori bolumu
- `<aside class="cart-panel">` -> sepet yan paneli
- `<section class="reviews-panel">` -> yorum formu + liste
- `<footer>` -> alt bilgi

### Dinamik alanlar (JS tarafindan doldurulan)

- `#foodList` -> kategori/urun kartlari
- `#cartList` -> sepet urunleri
- `#cartTotal` -> toplam
- `#reviewsList` -> yorumlar
- `#foodSelect` -> yorum formu dropdown

Neden onemli?

- Semantik etiketler okunabilirlik ve bakim kolayligi saglar
- Dinamik UI icin sabit "mount point" alanlari sunar

---

## 6) style.css (Tasarim ve Responsive Yapi)

### Tasarim tokenlari (`:root`)

Renk ve tema degerleri degiskenlerle tanimli:

```css
:root {
  --primary: #dc2626;
  --secondary: #b91c1c;
  --accent: #ef4444;
  --border: #d4dcf0;
  --shadow: 0 10px 25px rgba(31, 41, 55, 0.08);
}
```

Avantaj:

- Tema degisimi kolay
- Tutarlilik artar

### Layout yapisi

- `display: grid` -> genel yerlesim
- `flex` -> buton ve kart ici hizalama
- `@media` -> mobil uyumluluk

### Modern gorunum

- `border-radius`, `box-shadow`, gradient arkaplan
- hover + transition ile canli etki

### Senin ekletmis oldugun UI gelistirmeleri

- Baslangicta kategori secim paneli
- Kategoriye girdikten sonra geri donus butonu
- Geri donus butonunda icon/animasyon (ok sola kayiyor)
- Kategori kartlarinda daha guclu hover efektleri

---

## 7) script.js (Frontend Motoru - Tum Canlilik)

Burasi kullanici etkileşimini yoneten ana dosya.

### State (durum degiskenleri)

```js
let foods = [];
const cart = [];
let activeCategory = "ana_yemek";
let activeFoodId = null;
let isCategorySelectionStep = true;
```

### Kalp fonksiyon: renderFoods()

Bu fonksiyon 3 farkli gorunumu yonetir:

1. Kategori secim ekrani
2. Kategori urun listesi
3. Tek urun detay karti

Yani tek merkezli "state-driven rendering" kullanilir.

### Kategoriye giris ve geri donus

```js
function goToCategory(category) {
  activeCategory = category;
  activeFoodId = null;
  isCategorySelectionStep = false;
  renderFoods();
}

function backToCategorySelection() {
  activeFoodId = null;
  isCategorySelectionStep = true;
  renderFoods();
}
```

### Sepet akis mantigi

- `addToCart(foodId)` -> urunu diziye ekler
- `removeFromCart(index)` -> urunu cikarir
- `renderCart()` -> listeyi ve toplami gunceller

### API ile haberlesme (`fetch`)

- `loadFoods()` -> `/api/foods`
- `loadReviews()` -> `/api/reviews`
- `checkoutOrder()` -> `/api/orders` (POST)
- Yorum formu submit -> `/api/reviews` (POST)

---

## 8) AI/Oneri Alani - Net ve Duzgun Anlatim

### Bu projede "gercek LLM entegrasyonu" var mi?

Hayir. OpenAI/Gemini gibi bir modele dogrudan istek yok.

### Peki AI onerisi nasil calisiyor?

- Backend en populer ilk 3 urunu DB'den aliyor
- Bunlardan rastgele birini secip donuyor
- Frontend bunu "Bugunun onerisi" olarak gosteriyor

Backend kodu:

```js
const rows = await all(
  "SELECT id, name, price, popularity_score AS popularity FROM foods WHERE is_active = 1 ORDER BY popularity_score DESC LIMIT 3"
);
const pick = rows[Math.floor(Math.random() * rows.length)];
res.json(pick);
```

Frontend kodu:

```js
const response = await fetch("/api/suggestion");
const suggestion = await response.json();
aiSuggestionResult.textContent = `Bugunun onerisi: ${suggestion.name} (${suggestion.price} TL)`;
```

Sunum cumlesi:

"Bu surumde AI deneyimi, populerlik tabanli oneri algoritmasi ile saglandi.  
Bir sonraki asamada bu endpoint gercek bir LLM API'sine baglanacak sekilde tasarlandi."

---

## 9) Hocanin Sorabilecegi Zor Sorular ve Hazir Cevaplar

### Soru: SQL Injection nasil engellendi?
Cevap: Parametreli sorgular (`?`) kullandim.

### Soru: Sepet toplamini frontend gonderse daha kolay degil mi?
Cevap: Guvenlik icin backend tekrar hesapliyor; frontend verisi tek basina guvenilir degil.

### Soru: Bu gercek AI mi?
Cevap: Bu surumde heuristic tabanli "AI-benzeri" oneri var; dogrudan model API'si yok.

### Soru: Neden semantik etiketler (`header/main/aside`)?
Cevap: Erişilebilirlik, okunabilirlik ve bakim acisindan daha dogru.

### Soru: Neden helper fonksiyonlarla Promise yapisi kuruldu?
Cevap: Callback karmaşasini azaltmak, async/await ile temiz kod yazmak icin.

### Soru: Guvenlikte eksik alan var mi?
Cevap: Evet; demo oldugu icin gercek auth/sifreleme yok, `placeholder-hash` kullaniliyor.

---

## 10) Gelistirme Notlari (Dogruluk ve Dürüstlük)

Sunumda acikca belirt:

- Login/JWT/oturum yonetimi yok
- Sifre hash mantigi demo seviyesinde
- Odeme entegrasyonu yok
- AI endpoint gercek model cagrisi degil

Bu seffaflik teknik olgunluk gosterir.

---

## 11) 5 Dakikalik Kisa Sunum Akisi (Hazir)

1. Projenin amacini soyle: "Yemek secimi, sepet, siparis ve yorum akislarini tek uygulamada topladim."
2. Mimariyi anlat: Frontend + Backend + SQLite
3. `npm start` sonrasi akis: initDb -> API -> render
4. Kategori secim adimini goster (senin gelistirmen)
5. Sepet/siparis endpointini acikla
6. Oneri sisteminde AI-benzeri mantigi anlat
7. Son olarak: guclu yanlar + sonraki adimlar

---

## 12) Sonraki Asama (eger hoca "devaminda ne yapardin?" derse)

- Gercek AI modeli baglamak (OpenAI/Gemini)
- Kullanicinin gecmis siparislerine gore ozel oneri
- Giris/kayit + gercek sifre hash (bcrypt)
- Admin panel (urun ekle/guncelle)
- Siparis durum takip ekrani

---

Bu dosyayi direkt sunum notu olarak kullanabilirsin.  
Istersen ikinci bir dosya olarak "Sadece ezberlik soru-cevap" versiyonu da olusturabilirim.

