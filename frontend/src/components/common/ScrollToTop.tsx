import React from 'react';
import { useScrollToTop } from '../../hooks/useScrollToTop';

const ScrollToTop: React.FC = () => {
  // Use the custom hook to handle all scroll behavior
  useScrollToTop();

  return null;
};

export default ScrollToTop;
