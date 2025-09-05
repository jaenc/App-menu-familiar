import React from 'react';

const PrintIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0c1.291-.646 2.098-1.933 2.098-3.329s-.807-2.682-2.098-3.329m0 0V5.339c0-.816-.59-1.5-1.365-1.583A12.006 12.006 0 0 0 12 3.5c-1.642 0-3.23.323-4.682.916C6.59 4.919 6 5.603 6 6.419v4.25m12 0a42.415 42.415 0 0 0-12 0" />
  </svg>
);

export default PrintIcon;
