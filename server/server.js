const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const sqlite3 = require('sqlite3').verbose();
const { ImageAnnotatorClient } = require('@google-cloud/vision');

// GCP 인증
const client = new ImageAnnotatorClient({
  keyFilename: 'imagesearch-462119-c34efd05462c.json', // 경로 확인
});

const app = express();
app.use(cors());
app.use(express.static(path.join(__dirname, '../build')));
app.use('/uploads', express.static('uploads'));

// 업로드 폴더 설정
const upload = multer({ dest: 'uploads/' });

// DB 초기화
const db = new sqlite3.Database('keywords.db');
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS image_keywords (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      image_name TEXT,
      keyword TEXT,
      confidence REAL,
      detected_text TEXT,
      detected_logo TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

const csvWriter = createCsvWriter({
  path: 'keywords.csv',
  header: [
    { id: 'image_name', title: 'image_name' },
    { id: 'keyword', title: 'keyword' },
    { id: 'confidence', title: 'confidence' },
    { id: 'detected_text', title: 'detected_text' },
    { id: 'detected_logo', title: 'detected_logo' },
    { id: 'created_at', title: 'created_at' },
  ],
  append: fs.existsSync('keywords.csv'),
});

// 업로드 및 분석
app.post('/upload', upload.single('image'), async (req, res) => {
    const filePath = req.file.path;
    const fileName = req.file.originalname;

  try {
    const [labelResult] = await client.labelDetection(filePath);
    const labels = labelResult.labelAnnotations || [];

    const [textResult] = await client.textDetection(filePath);
    const texts = textResult.textAnnotations;
    const detectedText = texts.length > 0 ? texts[0].description.trim() : null;

    const [logoResult] = await client.logoDetection(filePath);
    const logos = logoResult.logoAnnotations;
    const detectedLogo = logos.length > 0 ? logos[0].description.trim() : null;

    const now = new Date().toISOString();

    // DB 저장
    const stmt = db.prepare(`INSERT INTO image_keywords (image_name, keyword, confidence, detected_text, detected_logo, created_at) VALUES (?, ?, ?, ?, ?, ?)`);
    
    const csvRecords = [];
    
    labels.forEach((label) => {
      stmt.run(fileName, label.description, label.score, detectedText, detectedLogo, now);
      csvRecords.push({
        image_name: fileName,
        keyword: label.description,
        confidence: Math.round(label.score * 100) / 100,
        detected_text: detectedText,
        detected_logo: detectedLogo,
        created_at: now,
      });
    });

    stmt.finalize();

    await csvWriter.writeRecords(csvRecords);

    const detectedLabels = labels.map(label => label.description.toLowerCase());
    const placeholders = detectedLabels.map(() => '?').join(',');
const params = [...detectedLabels, detectedText?.toLowerCase(), detectedLogo?.toLowerCase()];

    // SQL: labels, text, logo 중 하나라도 일치하는 product 찾기
    const sql = `
      SELECT * FROM product
      WHERE LOWER(product_label) IN (${placeholders})
         OR LOWER(product_text) = ?
         OR LOWER(product_logo) = ?
    `;

    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'DB 조회 실패' });
        return;
      }

    res.json({
      message: '업로드 및 분석 성공',
      filename: fileName,
      labels: csvRecords,
      detected_text: detectedText,
      detected_logo: detectedLogo,
      image_url: `http://localhost:4000/uploads/${req.file.filename}`,
      matched_products: rows,
    });
  });

    // 임시 파일 삭제
    fs.unlink(filePath, () => {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '분석 실패' });
  }
});

// 리액트 build index.html 서빙
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(4000, () => {
  console.log('서버 실행 중: http://localhost:4000');
});
