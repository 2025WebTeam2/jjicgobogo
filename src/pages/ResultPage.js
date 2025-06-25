import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('ResultPage location.state:', location.state);

  const {
    labels = [],
    detected_text,
    detected_logo,
    filename,
    image_url,
    matched_products = [],
  } = location.state || {};

  return (
    <div style={{ padding: 20 }}>
      <h2>분석 결과 - {filename}</h2>
      <img src={image_url} alt="Uploaded" style={{ maxWidth: '300px', border: '1px solid #ccc' }} />

      <h3>감지된 라벨(Keywords):</h3>
      {labels.length > 0 ? (
      <ul>
        {labels.map((item, idx) => (
          <li key={idx}>
            {item.keyword} - 신뢰도: {item.confidence}
          </li>
        ))}
      </ul>) : (
        <p>키워드가 없습니다.</p>
      )}

      <h3>감지된 텍스트:</h3>
      <p>{detected_text || '감지된 텍스트가 없습니다.'}</p>
      <h3>감지된 로고:</h3>
      <p>{detected_logo || '감지된 로고가 없습니다.'}</p>

      <h3>일치하는 상품 목록:</h3>
      {matched_products.length > 0 ? (
        <ul>
          {matched_products.map(prod => (
            <li key={prod.id}>
              제품명: {prod.product_name} / 판매자명: {prod.user_name} / 라벨(키워드): {prod.product_label} / 텍스트: {prod.product_text} / 로고: {prod.product_logo}
            </li>
          ))}
        </ul>
      ) : (
        <p>일치하는 상품이 없습니다.</p>
      )}

      <button onClick={() => navigate(-1)}>뒤로가기</button>
    </div>
  );
}

export default ResultPage;