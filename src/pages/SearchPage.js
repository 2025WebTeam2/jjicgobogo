// SearchPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchBox from '../components/SearchBox';
import '../styles/Search.css';

function SearchPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    navigate('/result', { state: { query } });
  };

  return (
    <div className='search-page'>
      <div className='search-header'>
        <img src='/logo.png' alt='로고' className='logo-image' />
        <h1 className='logo-text'>찍고보고</h1>
      </div>
      <SearchBox query={query} setQuery={setQuery} onSearch={handleSearch} />
    </div>
  );
}

export default SearchPage;
