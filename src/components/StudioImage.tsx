import React, { useEffect, useState } from 'react';
import { Bike, Package, Shield } from 'lucide-react';

interface StudioImageProps {
  src: string;
  alt: string;
  loading?: 'eager' | 'lazy';
  className?: string;
  imgClassName?: string;
  style?: React.CSSProperties;
  fallbackType?: 'bike' | 'part' | 'gear';
  fallbackLabel?: string;
  onError?: () => void;
}

export const StudioImage: React.FC<StudioImageProps> = ({
  src,
  alt,
  loading = 'lazy',
  className = 'w-full h-full',
  imgClassName = '',
  style,
  fallbackType = 'part',
  fallbackLabel,
  onError,
}) => {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>(
    src ? 'loading' : 'error'
  );

  useEffect(() => {
    setStatus(src ? 'loading' : 'error');
  }, [src]);

  if (status === 'error' || !src) {
    const FallbackIcon =
      fallbackType === 'bike'
        ? Bike
        : fallbackType === 'gear'
        ? Shield
        : Package;
    return (
      <div
        className={`flex flex-col items-center justify-center text-zinc-400 select-none ${className}`}
      >
        <FallbackIcon className="w-8 h-8" strokeWidth={1.35} />
        {fallbackLabel && (
          <span className="mt-1 text-[11px] font-medium text-zinc-500 text-center line-clamp-1 px-2">
            {fallbackLabel}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {status === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-1 rounded-xl bg-zinc-200/70 animate-pulse"
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        style={style}
        onLoad={() => setStatus('loaded')}
        onError={() => {
          setStatus('error');
          onError?.();
        }}
        className={`w-full h-full object-contain mix-blend-multiply select-none transition-opacity duration-300 ${
          status === 'loaded' ? 'opacity-100' : 'opacity-0'
        } ${imgClassName}`}
      />
    </div>
  );
};
