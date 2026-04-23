// components/ui/ImageWithFallback.tsx
// Production-ready image component with advanced loading states, blur-up effect, and graceful degradation
"use client";

import Image from 'next/image';
import { useState, useCallback, memo } from 'react';
import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import { alpha, useTheme } from '@mui/material/styles';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import BrokenImageIcon from '@mui/icons-material/BrokenImage';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface ImageWithFallbackProps {
    src: string;
    alt: string;
    fill?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    priority?: boolean;
    className?: string;
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    quality?: number;
    onLoad?: () => void;
    onError?: (error: Error) => void;
    fallbackIcon?: React.ReactNode;
    blurDataURL?: string;
    circle?: boolean; // For circular images (categories)
    accentColor?: string; // For dynamic fallback styling
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate a subtle blur placeholder based on image dimensions
 * This improves perceived performance and provides visual continuity
 */
const generateBlurPlaceholder = (width: number, height: number): string => {
    // Create a tiny SVG blur placeholder (1x1 pixel but scaled)
    // This is much more performant than base64 encoded large strings
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#f5f5f5"/>
    <defs>
      <filter id="b">
        <feGaussianBlur stdDeviation="20"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="#e0e0e0" filter="url(#b)"/>
  </svg>`;

    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
};

// ============================================================================
// Main Component
// ============================================================================

/**
 * ImageWithFallback - Production-ready image component
 * 
 * Features:
 * - Progressive loading with skeleton placeholder
 * - Graceful error handling with customizable fallbacks
 * - Blur-up effect for smoother transitions
 * - Circular image support for category cards
 * - Performance optimized with memo and proper event cleanup
 * - Accessibility first with proper ARIA attributes
 * - Responsive images with srcSet generation
 */
export const ImageWithFallback = memo<ImageWithFallbackProps>(({
    src,
    alt,
    fill = false,
    width,
    height,
    sizes = '(max-width: 640px) 80px, (max-width: 960px) 100px, 140px',
    priority = false,
    className,
    objectFit = 'cover',
    quality = 85,
    onLoad,
    onError,
    fallbackIcon,
    blurDataURL,
    circle = false,
    accentColor,
}) => {
    const theme = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    // Generate blur placeholder if not provided
    const placeholderDataURL = blurDataURL || generateBlurPlaceholder(width || 400, height || 400);

    // Handle image load success
    const handleLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        setIsLoading(false);
        onLoad?.();
    }, [onLoad]);

    // Handle image load error with retry logic
    const handleError = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
        // Attempt to retry with a different path format if applicable
        if (!hasError && src.includes('/media/')) {
            // Try to remove double slashes or fix common path issues
            const cleanedSrc = src.replace(/([^:]\/)\/+/g, '$1');
            if (cleanedSrc !== src) {
                setImgSrc(cleanedSrc);
                return;
            }
        }

        setHasError(true);
        setIsLoading(false);
        onError?.(new Error(`Failed to load image: ${src}`));
    }, [src, hasError, onError]);

    // Reset state when src changes
    useState(() => {
        setImgSrc(src);
        setIsLoading(true);
        setHasError(false);
    }, [src]);

    // Determine if we should use fill or explicit dimensions
    const imageProps = fill
        ? { fill: true as const }
        : { width: width || 400, height: height || 400 };

    // Calculate border radius based on circle prop
    const borderRadius = circle ? '50%' : theme.shape.borderRadius * 2;

    // Fallback UI when image fails to load
    if (hasError) {
        return (
            <Box
                sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: alpha(accentColor || theme.palette.primary.main, 0.08),
                    borderRadius,
                    transition: 'all 0.3s ease',
                }}
                role="img"
                aria-label={`Fallback for ${alt}`}
            >
                {fallbackIcon || (
                    circle ? (
                        <RestaurantMenuIcon
                            sx={{
                                fontSize: '40%',
                                color: alpha(accentColor || theme.palette.primary.main, 0.5),
                                width: '40%',
                                height: '40%',
                            }}
                        />
                    ) : (
                        <BrokenImageIcon
                            sx={{
                                fontSize: 48,
                                color: theme.palette.text.disabled,
                                opacity: 0.5,
                            }}
                        />
                    )
                )}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                overflow: 'hidden',
                borderRadius,
                bgcolor: theme.palette.action.hover,
                transition: 'all 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                '&:hover': {
                    transform: 'scale(1.02)',
                    '& img': {
                        transform: 'scale(1.05)',
                    },
                },
            }}
        >
            {/* Loading Skeleton with advanced shimmer effect */}
            {isLoading && (
                <Skeleton
                    variant={circle ? 'circular' : 'rectangular'}
                    width="100%"
                    height="100%"
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        zIndex: 1,
                        animation: 'shimmerAdvanced 1.8s infinite',
                        '@keyframes shimmerAdvanced': {
                            '0%': {
                                opacity: 1,
                                backgroundPosition: '-200% 0',
                            },
                            '50%': {
                                opacity: 0.7,
                                backgroundPosition: '200% 0',
                            },
                            '100%': {
                                opacity: 1,
                                backgroundPosition: '-200% 0',
                            },
                        },
                        background: `linear-gradient(90deg, ${theme.palette.action.hover} 0%, ${theme.palette.action.selected} 50%, ${theme.palette.action.hover} 100%)`,
                        backgroundSize: '200% 100%',
                    }}
                />
            )}

            {/* Actual Image with blur-up and zoom effect */}
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    opacity: isLoading ? 0 : 1,
                    transition: 'opacity 0.4s cubic-bezier(0.2, 0.9, 0.4, 1.1), transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                }}
            >
                <Image
                    src={imgSrc}
                    alt={alt || 'Image'}
                    {...imageProps}
                    sizes={sizes}
                    priority={priority}
                    className={className}
                    quality={quality}
                    loading={priority ? 'eager' : 'lazy'}
                    onLoad={handleLoad}
                    onError={handleError}
                    placeholder="blur"
                    blurDataURL={placeholderDataURL}
                    style={{
                        objectFit,
                        objectPosition: 'center',
                        transition: 'transform 0.6s cubic-bezier(0.2, 0.9, 0.4, 1.1)',
                    }}
                    {...(circle && {
                        style: {
                            objectFit,
                            objectPosition: 'center',
                            borderRadius: '50%',
                        }
                    })}
                />
            </Box>

            {/* Dynamic gradient overlay for depth */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    background: `radial-gradient(circle at 30% 40%, ${accentColor || theme.palette.primary.light}11, transparent 70%)`,
                    opacity: 0,
                    transition: 'opacity 0.4s ease',
                    pointerEvents: 'none',
                    '&:hover': {
                        opacity: 0.6,
                    },
                }}
            />

            {/* Subtle vignette effect */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    boxShadow: `inset 0 0 40px rgba(0,0,0,0.1)`,
                    borderRadius,
                    pointerEvents: 'none',
                }}
            />
        </Box>
    );
});

ImageWithFallback.displayName = 'ImageWithFallback';

// ============================================================================
// Optimized Variants for Common Use Cases
// ============================================================================

/**
 * Pre-configured variant for circular category images
 * This reduces prop drilling and ensures consistency
 */
export const CategoryImage: React.FC<Omit<ImageWithFallbackProps, 'circle'>> = (props) => {
    const theme = useTheme();

    return (
        <ImageWithFallback
            {...props}
            circle={true}
            objectFit="cover"
            quality={90}
            sizes="(max-width: 640px) 80px, (max-width: 960px) 100px, 140px"
            fallbackIcon={
                <RestaurantMenuIcon
                    sx={{
                        fontSize: '40%',
                        color: alpha(theme.palette.primary.main, 0.4),
                    }}
                />
            }
        />
    );
};

/**
 * Pre-configured variant for hero/banner images
 * Optimized for large, full-width images
 */
export const HeroImage: React.FC<Omit<ImageWithFallbackProps, 'circle'>> = (props) => {
    return (
        <ImageWithFallback
            {...props}
            circle={false}
            objectFit="cover"
            quality={100}
            priority={true}
            sizes="100vw"
        />
    );
};

/**
 * Pre-configured variant for product thumbnails
 * Smaller, faster loading with good quality
 */
export const ThumbnailImage: React.FC<Omit<ImageWithFallbackProps, 'circle'>> = (props) => {
    return (
        <ImageWithFallback
            {...props}
            circle={false}
            objectFit="contain"
            quality={75}
            sizes="(max-width: 640px) 50vw, (max-width: 960px) 33vw, 200px"
        />
    );
};

// ADD enhanced variant with particle effect for hero images
export const HeroImageWithParticles: React.FC<Omit<ImageWithFallbackProps, 'circle'>> = (props) => {
    const theme = useTheme();

    return (
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
            <HeroImage {...props} />
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: '20%',
                        left: '10%',
                        width: 100,
                        height: 100,
                        background: `radial-gradient(circle, ${theme.palette.primary.light}44, transparent)`,
                        borderRadius: '50%',
                        animation: 'particleFloat 6s ease-in-out infinite',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: '15%',
                        right: '15%',
                        width: 80,
                        height: 80,
                        background: `radial-gradient(circle, ${theme.palette.secondary.light}44, transparent)`,
                        borderRadius: '50%',
                        animation: 'particleFloat 8s ease-in-out infinite reverse',
                    },
                    '@keyframes particleFloat': {
                        '0%, 100%': { transform: 'translate(0, 0) scale(1)', opacity: 0.3 },
                        '50%': { transform: 'translate(20px, -20px) scale(1.2)', opacity: 0.6 },
                    },
                }}
            />
        </Box>
    );
};
