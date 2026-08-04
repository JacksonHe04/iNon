import React, { useState, useEffect } from 'react';

interface BlockImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallback: React.ReactNode;
  active?: boolean;
}

export default function BlockImage({
  src,
  alt,
  className = "aspect-square rounded-lg mb-2 object-cover w-full",
  fallback,
  active = true,
}: BlockImageProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!active || !src || hasError) {
    return <>{fallback}</>;
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      fetchPriority="low"
      onError={() => setHasError(true)}
      className={className}
    />
  );
}
