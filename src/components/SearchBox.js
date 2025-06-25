import React, { useRef,useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Search.css'; // 또는 맞는 경로로 수정

function SearchBox() {
  const fileInputRef = useRef();
  const [imageUrl, setImageUrl] = useState(null);
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  // 이미지 아이콘 클릭 시 숨겨진 파일 입력 열기
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // 파일 선택 후 처리
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      //alert(`선택한 파일: ${selectedFile.name}`);
      const url = URL.createObjectURL(selectedFile); // 이미지 URL 생성
      setImageUrl(url);
      setFile(selectedFile);
    }
  };

const handleSearch = async () => {
    if (!file) {
      alert('먼저 이미지를 선택하세요.');
      return;
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('http://localhost:4000/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('서버 응답 오류');

      const data = await res.json();

      navigate('/result', { state: { 
        labels: data.labels, 
        detected_text: data.detected_text, 
        detected_logo: data.detected_logo, 
        filename: data.filename,
        image_url: imageUrl,
        matched_products: data.matched_products,
      },
     });
    } catch (err) {
      alert('업로드 및 분석 중 오류가 발생했습니다.');
      console.error(err);
    }
  };

  return (
    <>
      <div className='search-box'>
        <input type='text' placeholder='검색을 통해 원하는 물건을 찾아보세요' className='search-input' value="" />
        <button className='icon-button' aria-label='검색' onClick={handleSearch}>🔍</button>
        <button type='button' className='icon-button' onClick={handleImageClick} aria-label='이미지 업로드'>🖼️</button>
        <input type='file' accept='image/*' style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
      </div>

      {imageUrl && (
        <div style={{ marginTop: 10, padding: 10, backgroundColor: '#eee', borderRadius: 4 }}>
          <img src={imageUrl} alt='선택한 이미지' style={{ maxWidth: '100%', maxHeight: 200, objectFit: 'contain' }} />
        </div>
      )}
    </>
  );
}

export default SearchBox;