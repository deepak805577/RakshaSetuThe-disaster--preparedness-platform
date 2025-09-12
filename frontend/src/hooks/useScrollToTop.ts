import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Custom hook to handle scroll position on route changes only
 * Ensures the page starts from the top when navigating between routes
 */
export const useScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    // Simple scroll to top on route change
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'auto'
      });
    };

    // Immediate scroll to top
    scrollToTop();

    // Single delayed scroll to handle any initial content loading
    const timeout = setTimeout(scrollToTop, 100);

    return () => {
      clearTimeout(timeout);
    };
  }, [location.pathname]); // Only trigger on pathname changes, not search or hash
};

/**
 * Scroll to top function that can be called manually
 */
export const scrollToTop = () => {
  try {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth'
    });
  } catch (error) {
    // Fallback for older browsers
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }
};

/**
 * Immediate scroll to top without animation
 */
export const scrollToTopImmediate = () => {
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
};
