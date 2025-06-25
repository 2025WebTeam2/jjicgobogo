import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SearchPage from './pages/SearchPage';
import ResultPage from './pages/ResultPage';
import { useLocation } from 'react-router-dom';

function ResultPageWrapper() {
  const location = useLocation();
  const { labels, detected_text, detected_logo, filename, image_url  } = location.state || {};
  return <ResultPage labels={labels} detected_text={detected_text} detected_logo={detected_logo} filename={filename} image_url={image_url}/>;
}

function App() {
  return (
  <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchPage />} />
        <Route path="/result" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}

//npm run build
//cd C:\Users\kwons\image_search\server
//node server.js
export default App;