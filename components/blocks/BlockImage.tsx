import React, { useState, useEffect } from 'react';

interface BlockImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}

export default function BlockImage({ src, alt, className = "aspect-video rounded-lg mb-2 object-cover w-full", fallback }: BlockImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
