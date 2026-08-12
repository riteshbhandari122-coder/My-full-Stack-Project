import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductsPage from './ProductsPage';

const SearchPage = () => {
  // SearchPage is essentially ProductsPage with search query pre-filled
  return <ProductsPage />;
};

export default SearchPage;
