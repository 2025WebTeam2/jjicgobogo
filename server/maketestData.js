const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('keywords.db');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS product (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_name TEXT,
      user_name TEXT,
      product_label TEXT,
      product_text TEXT,
      product_logo TEXT
    )
  `);

  // 임의 데이터 5개 삽입 (중복 방지를 위해 먼저 삭제)
  db.run(`DELETE FROM product`, () => {
    const stmt = db.prepare(`
      INSERT INTO product (product_name, user_name, product_label, product_text, product_logo)
      VALUES (?, ?, ?, ?, ?)
    `);

    const products = [
      ['마우스', '홍길동', 'electronics', '', 'Logitech'],
      ['스마트폰', '김철수', 'mobile', 'touchscreen', 'apple'],
      ['ALLRIGHT티셔츠', '이영희', 'shirts', 'ALL RIGHT', 'brandC'],
      ['흰 티셔츠', '박민수', 'White', 'high resolution', ''],
      ['허브', '최지은', 'accessory', 'leather', 'brandE'],
    ];

    products.forEach(p => stmt.run(...p));
    stmt.finalize();
  });
});