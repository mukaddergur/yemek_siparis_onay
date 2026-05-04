const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const dbPath = path.join(__dirname, "yemeksepeti.db");
const schemaPath = path.join(__dirname, "database.sql");
const db = new sqlite3.Database(dbPath);

/** Tatli karti icin calisan gorsel URL'si. */
const DESSERT_IMAGE_URL =
  "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=900&q=80";

const MENU_CATALOG = [
  {
    name: "Izgara Kofte Tabagi",
    category: "ana_yemek",
    description: "Baharatli izgara kofte, pilav ve sumakli sogan ile servis edilir.",
    imageUrl:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=900&q=80",
    price: 245,
    popularity: 95
  },
  {
    name: "Et Sote Pilav",
    category: "ana_yemek",
    description: "Lokum gibi et sote, tane tane pilav ve biberiyeli sos ile servis edilir.",
    imageUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80",
    price: 255,
    popularity: 90
  },
  {
    name: "Etli Taco Tabagi",
    category: "ana_yemek",
    description: "Baharatli et, ozel sos ve taze malzemelerle hazirlanan doyurucu taco tabagi.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/35/Tacos_de_carnitas.jpg",
    price: 215,
    popularity: 87
  },
  {
    name: "Somon Bowl",
    category: "ana_yemek",
    description: "Teriyaki somon, yasemin pirinci ve taze sebzelerle dengeli bir tabak.",
    imageUrl:
      "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=900&q=80",
    price: 285,
    popularity: 92
  },
  {
    name: "Sebzeli Noodle",
    category: "ana_yemek",
    description: "Wok'ta sotelenmis sebzeler, soya sosu ve susamla servis edilir.",
    imageUrl:
      "https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?auto=format&fit=crop&w=900&q=80",
    price: 205,
    popularity: 84
  },
  {
    name: "Limonata",
    category: "icecek",
    description: "Taze limon, nane ve hafif seker dengesiyle ferah yaz lezzeti.",
    imageUrl:
      "https://images.unsplash.com/photo-1621263764928-df1444c5e859?auto=format&fit=crop&w=900&q=80",
    price: 65,
    popularity: 80
  },
  {
    name: "Cold Brew Kahve",
    category: "icecek",
    description: "18 saat demlenmis yogun aromali soguk kahve.",
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=900&q=80",
    price: 75,
    popularity: 88
  },
  {
    name: "Meyve Smoothie",
    category: "icecek",
    description: "Cilek, muz ve yogurdun bulustugu enerji veren smoothie.",
    imageUrl:
      "https://images.unsplash.com/photo-1505252585461-04db1eb84625?auto=format&fit=crop&w=900&q=80",
    price: 82,
    popularity: 85
  },
  {
    name: "Serinletici Ev Icecegi",
    category: "icecek",
    description: "Hafif ve ferahlatan, yemek yanina uygun soguk icecek secenegi.",
    imageUrl:
      "https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=900&q=80",
    price: 48,
    popularity: 76
  },
  {
    name: "Gazoz",
    category: "icecek",
    description: "Narenciye aromali soguk gazoz, yemeklerin yanina cok yakisir.",
    imageUrl:
      "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?auto=format&fit=crop&w=900&q=80",
    price: 52,
    popularity: 72
  },
  {
    name: "San Sebastian",
    category: "tatli",
    description: "Karamelize ust yuzeyli, akiskan dokulu cheesecake.",
    imageUrl:
      "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=900&q=80",
    price: 135,
    popularity: 91
  },
  {
    name: "Magnolia",
    category: "tatli",
    description: "Biskuvi tabani, hafif krema ve meyve dokunusu.",
    imageUrl: DESSERT_IMAGE_URL,
    price: 120,
    popularity: 86
  },
  {
    name: "Serbetli Ozel Tatli",
    category: "tatli",
    description: "Geleneksel sunumlu, serbet dokunusuyla servis edilen ozel tatli secenegi.",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/c7/Baklava%281%29.png",
    price: 145,
    popularity: 89
  },
  {
    name: "Profiterol",
    category: "tatli",
    description: "Kremali hamur toplari ve bol cikolata sosu ile hazirlanir.",
    imageUrl:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80",
    price: 118,
    popularity: 82
  },
  {
    name: "Ev Usulu Sutlu Tatli",
    category: "tatli",
    description: "Hafif, kremamsi dokuda ve geleneksel sunumla hazirlanan sutlu tatli.",
    imageUrl:
      "https://images.unsplash.com/photo-1470124182917-cc6e71b22ecc?auto=format&fit=crop&w=900&q=80",
    price: 96,
    popularity: 78
  }
];

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

async function createOrGetUser(fullName, email) {
  const safeName = fullName || "Misafir Kullanici";
  const safeEmail = email || `misafir_${Date.now()}@local.dev`;
  const existing = await get("SELECT id FROM users WHERE email = ?", [safeEmail]);
  if (existing) {
    return existing.id;
  }

  const result = await run(
    "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
    [safeName, safeEmail, "placeholder-hash"]
  );
  return result.lastID;
}

async function initDb() {
  if (!fs.existsSync(schemaPath)) {
    throw new Error("database.sql dosyasi bulunamadi.");
  }

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await exec(schemaSql);
  const foodColumns = await all("PRAGMA table_info(foods)");
  const hasCategoryColumn = foodColumns.some((column) => column.name === "category");
  if (!hasCategoryColumn) {
    await run("ALTER TABLE foods ADD COLUMN category TEXT NOT NULL DEFAULT 'ana_yemek'");
  }

  for (const item of MENU_CATALOG) {
    const existingFood = await get("SELECT id FROM foods WHERE LOWER(name) = LOWER(?)", [item.name]);
    if (existingFood) {
      await run(
        `UPDATE foods
         SET description = ?, image_url = ?, price = ?, popularity_score = ?, category = ?, is_active = 1
         WHERE id = ?`,
        [item.description, item.imageUrl, item.price, item.popularity, item.category, existingFood.id]
      );
    } else {
      await run(
        "INSERT INTO foods (name, category, description, image_url, price, popularity_score) VALUES (?, ?, ?, ?, ?, ?)",
        [item.name, item.category, item.description, item.imageUrl, item.price, item.popularity]
      );
    }
  }

  const catalogNames = MENU_CATALOG.map((item) => item.name.toLowerCase());
  const allFoods = await all("SELECT id, name FROM foods");
  for (const food of allFoods) {
    if (!catalogNames.includes(food.name.toLowerCase())) {
      await run("UPDATE foods SET is_active = 0 WHERE id = ?", [food.id]);
    }
  }
}

app.get("/api/foods", async (req, res) => {
  try {
    const rows = await all(
      "SELECT id, name, category, description, image_url AS image, price, popularity_score AS popularity FROM foods WHERE is_active = 1 ORDER BY CASE category WHEN 'ana_yemek' THEN 1 WHEN 'icecek' THEN 2 WHEN 'tatli' THEN 3 ELSE 4 END, id ASC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Yemekler alinamadi." });
  }
});

app.get("/api/reviews", async (req, res) => {
  try {
    const rows = await all(
      `SELECT r.id, r.food_id AS foodId, f.name AS foodName, r.rating, r.comment, r.created_at AS createdAt
       FROM reviews r
       JOIN foods f ON f.id = r.food_id
       ORDER BY r.created_at DESC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Yorumlar alinamadi." });
  }
});

app.post("/api/reviews", async (req, res) => {
  const { foodId, rating, comment, fullName, email } = req.body || {};
  if (!foodId || !rating || !comment || rating < 1 || rating > 5) {
    res.status(400).json({ error: "Gecersiz yorum verisi." });
    return;
  }

  try {
    const userId = await createOrGetUser(fullName, email);
    const food = await get("SELECT id, name FROM foods WHERE id = ? AND is_active = 1", [foodId]);
    if (!food) {
      res.status(404).json({ error: "Yemek bulunamadi." });
      return;
    }

    await run(
      "INSERT INTO reviews (user_id, food_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, foodId, rating, comment.trim()]
    );

    res.status(201).json({ message: "Yorum eklendi." });
  } catch (error) {
    res.status(500).json({ error: "Yorum kaydedilemedi." });
  }
});

app.get("/api/suggestion", async (req, res) => {
  try {
    const rows = await all(
      "SELECT id, name, price, popularity_score AS popularity FROM foods WHERE is_active = 1 ORDER BY popularity_score DESC LIMIT 3"
    );
    if (!rows.length) {
      res.status(404).json({ error: "Oneri bulunamadi." });
      return;
    }
    const pick = rows[Math.floor(Math.random() * rows.length)];
    res.json(pick);
  } catch (error) {
    res.status(500).json({ error: "Oneri alinamadi." });
  }
});

app.post("/api/orders", async (req, res) => {
  const { items, orderNote, fullName, email } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400).json({ error: "Siparis kalemleri bos olamaz." });
    return;
  }

  try {
    const userId = await createOrGetUser(fullName, email);
    let total = 0;
    const preparedItems = [];

    for (const item of items) {
      const quantity = Number(item.quantity || 1);
      const foodId = Number(item.foodId);
      if (!foodId || quantity <= 0) {
        res.status(400).json({ error: "Gecersiz urun bilgisi." });
        return;
      }

      const food = await get("SELECT id, price FROM foods WHERE id = ? AND is_active = 1", [foodId]);
      if (!food) {
        res.status(404).json({ error: `Yemek bulunamadi: ${foodId}` });
        return;
      }

      total += food.price * quantity;
      preparedItems.push({ foodId, quantity, unitPrice: food.price });
    }

    const orderResult = await run(
      "INSERT INTO orders (user_id, total_amount, status, order_note) VALUES (?, ?, ?, ?)",
      [userId, total, "confirmed", orderNote || ""]
    );
    const orderId = orderResult.lastID;

    for (const item of preparedItems) {
      await run(
        "INSERT INTO order_items (order_id, food_id, quantity, unit_price) VALUES (?, ?, ?, ?)",
        [orderId, item.foodId, item.quantity, item.unitPrice]
      );
    }

    res.status(201).json({
      message: "Siparis onaylandi.",
      orderId,
      totalAmount: total
    });
  } catch (error) {
    res.status(500).json({ error: "Siparis kaydedilemedi." });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server hazir: http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Veritabani baslatma hatasi:", error.message);
  });
