import React, { useEffect, useMemo, useState } from 'react';
import { Bike } from 'lucide-react';
import { ColorOption } from '../data/motorcycles';
import {
  PaintMaskData,
  getPaintMaskForImage,
  hexToHsl,
  hueDistance,
} from '../utils/paintMask';

interface PaintedBikeImageProps {
  src: string;
  colorImages?: Record<string, string>;
  selectedColor: ColorOption;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'eager' | 'lazy';
  onError?: () => void;
}

export const PaintedBikeImage: React.FC<PaintedBikeImageProps> = ({
  src,
  colorImages,
  selectedColor,
  alt,
  className = 'w-full h-full',
  imgClassName = '',
  loading = 'eager',
  onError,
}) => {
  const variantSrc = colorImages?.[selectedColor.id]?.trim();
  const effectiveSrc = variantSrc || src;
  const [maskData, setMaskData] = useState<PaintMaskData | null>(null);
  const [imgStatus, setImgStatus] = useState<'loading' | 'loaded' | 'error'>(
    effectiveSrc ? 'loading' : 'error'
  );

  useEffect(() => {
    setImgStatus(effectiveSrc ? 'loading' : 'error');
  }, [effectiveSrc]);

  useEffect(() => {
    let active = true;
    if (variantSrc || !src || imgStatus !== 'loaded') {
      if (variantSrc || !src) setMaskData(null);
      return;
    }
    getPaintMaskForImage(src).then((result) => {
      if (active) setMaskData(result);
    });
    return () => {
      active = false;
    };
  }, [src, variantSrc, imgStatus]);

  const paintProfile = useMemo(() => {
    const [targetH, targetS, targetL] = hexToHsl(selectedColor.hex);
    const isMatteBlack = targetL < 0.16 && targetS < 0.22;
    const isPearlWhite =
      (targetL > 0.78 && targetS < 0.22) || Boolean(selectedColor.isLightSwatch);

    let isNativeMatch = false;
    if (maskData) {
      if (maskData.isAchromaticBase) {
        isNativeMatch = isMatteBlack;
      } else if (!isMatteBlack && !isPearlWhite && targetS >= 0.25) {
        isNativeMatch =
          hueDistance(targetH, maskData.sourceHue) < 16 &&
          Math.abs(targetL - maskData.sourceLum) < 0.22;
      }
    }

    const lumDelta = maskData ? targetL - maskData.sourceLum : 0;

    return {
      targetH,
      targetS,
      targetL,
      isMatteBlack,
      isPearlWhite,
      isNativeMatch,
      lumDelta,
    };
  }, [selectedColor.hex, selectedColor.isLightSwatch, maskData]);

  const maskStyle: React.CSSProperties | undefined =
    !variantSrc && maskData?.maskUrl
      ? {
          WebkitMaskImage: `url(${maskData.maskUrl})`,
          maskImage: `url(${maskData.maskUrl})`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
        }
      : undefined;

  const showMaskedOverlay =
    !variantSrc &&
    imgStatus === 'loaded' &&
    Boolean(maskStyle) &&
    !paintProfile.isNativeMatch;

  if (imgStatus === 'error') {
    return (
      <div
        className={`flex flex-col items-center justify-center text-zinc-400 select-none ${className}`}
      >
        <Bike className="w-10 h-10" strokeWidth={1.3} />
        <span className="mt-1.5 text-[11px] font-medium text-zinc-500 text-center px-3 line-clamp-1">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center ${className} ${imgClassName} transition-all duration-300`}
    >
      {imgStatus === 'loading' && (
        <div
          aria-hidden="true"
          className="absolute inset-2 rounded-2xl bg-zinc-200/70 animate-pulse"
        />
      )}

      <img
        src={effectiveSrc}
        alt={alt}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={() => setImgStatus('loaded')}
        onError={() => {
          setImgStatus('error');
          onError?.();
        }}
        className={`w-full h-full object-contain mix-blend-multiply select-none transition-all duration-300 ${
          imgStatus === 'loaded' ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {maskStyle && (
        <>
          {paintProfile.isMatteBlack ? (
            <>
              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: '#18181B',
                  mixBlendMode: 'saturation',
                  opacity: showMaskedOverlay ? 0.96 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              />
              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: selectedColor.hex,
                  mixBlendMode: 'multiply',
                  opacity: showMaskedOverlay ? 0.86 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              />
              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: '#52525B',
                  mixBlendMode: 'soft-light',
                  opacity: showMaskedOverlay ? 0.35 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              />
            </>
          ) : paintProfile.isPearlWhite ? (
            <>
              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: '#FFFFFF',
                  mixBlendMode: 'saturation',
                  opacity: showMaskedOverlay ? 0.96 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              />
              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: '#FFFFFF',
                  mixBlendMode: 'screen',
                  opacity: showMaskedOverlay ? 0.68 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              />
              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: '#F4F4F5',
                  mixBlendMode: 'soft-light',
                  opacity: showMaskedOverlay ? 0.42 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
              />
            </>
          ) : (
            <>
              {maskData?.isAchromaticBase && (
                <div
                  aria-hidden="true"
                  style={{
                    ...maskStyle,
                    backgroundColor: '#FFFFFF',
                    mixBlendMode: 'screen',
                    opacity: showMaskedOverlay ? 0.44 : 0,
                  }}
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                />
              )}

              {!maskData?.isAchromaticBase && paintProfile.lumDelta > 0.12 && (
                <div
                  aria-hidden="true"
                  style={{
                    ...maskStyle,
                    backgroundColor: '#FFFBEB',
                    mixBlendMode: 'screen',
                    opacity: showMaskedOverlay
                      ? Math.min(0.56, paintProfile.lumDelta * 1.35)
                      : 0,
                  }}
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                />
              )}

              {!maskData?.isAchromaticBase && paintProfile.lumDelta < -0.14 && (
                <div
                  aria-hidden="true"
                  style={{
                    ...maskStyle,
                    backgroundColor: selectedColor.hex,
                    mixBlendMode: 'multiply',
                    opacity: showMaskedOverlay
                      ? Math.min(0.42, Math.abs(paintProfile.lumDelta) * 0.85)
                      : 0,
                  }}
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                />
              )}

              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: selectedColor.hex,
                  mixBlendMode: 'color',
                  filter: 'saturate(1.14)',
                  opacity: showMaskedOverlay ? 0.94 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-all duration-300"
              />

              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: selectedColor.hex,
                  mixBlendMode: 'hue',
                  opacity: showMaskedOverlay ? 0.36 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-all duration-300"
              />

              <div
                aria-hidden="true"
                style={{
                  ...maskStyle,
                  backgroundColor: selectedColor.hex,
                  mixBlendMode: 'soft-light',
                  opacity: showMaskedOverlay ? 0.2 : 0,
                }}
                className="pointer-events-none absolute inset-0 transition-all duration-300"
              />
            </>
          )}
        </>
      )}
    </div>
  );
};
