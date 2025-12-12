import React from 'react';
import { Link } from 'react-router-dom';

export default function PrefetchLink({ to, preload, children, ...props }) {
  const trigger = () => {
    if (preload && typeof preload === 'function') preload();
    // also optionally prefetch data via a fetch call here
  };

  return (
    <Link
      to={to}
      onMouseEnter={trigger}
      onFocus={trigger}
      onTouchStart={trigger}
      {...props}
    >
      {children}
    </Link>
  );
}
