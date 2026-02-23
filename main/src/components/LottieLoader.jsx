import React, { memo, useMemo, useEffect, useState } from 'react';
import CircularProgress from '@mui/material/CircularProgress';

// Resilient Lottie loader: lazy-loads the Lottie runtime + JSON on the client
// and falls back to a CircularProgress if anything fails.
const LottieLoader = ({ size = 24, loop = true, invert = false, ariaLabel = 'loading', style = {} }) => {
  const [LottieComp, setLottieComp] = useState(null);
  const [animationData, setAnimationData] = useState(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Load the lottie renderer and JSON only on the client to avoid import/runtime issues
    Promise.all([
      import('lottie-react').then((m) => m.default ?? m),
      import('../lotties/loading-main.json').then((m) => m.default ?? m),
    ])
      .then(([LottieDefault, anim]) => {
        if (!mounted) return;
        setLottieComp(() => LottieDefault);
        setAnimationData(anim);
      })
      .catch((err) => {
        // Keep a console trace for debugging — UI will show fallback
        // eslint-disable-next-line no-console
        console.error('LottieLoader: failed to load animation', err);
        if (mounted) setLoadError(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const containerStyle = useMemo(() => ({
    width: size,
    height: size,
    display: 'inline-block',
    verticalAlign: 'middle',
    lineHeight: 0,
    color: invert ? '#fff' : 'inherit',
    ...style,
  }), [size, style, invert]);

  const filterStyle = invert ? { filter: 'brightness(0) invert(1)' } : undefined;

  // Render fallback while Lottie is still loading or if it failed to load
  if (!LottieComp || !animationData || loadError) {
    return (
      <span role="status" aria-label={ariaLabel} style={containerStyle}>
        <div style={filterStyle}>
          <CircularProgress
            size={Math.max(8, Math.min(size, 64))}
            thickness={5}
            sx={{ color: 'currentColor' }}
          />
        </div>
      </span>
    );
  }

  return (
    <span role="status" aria-label={ariaLabel} style={containerStyle}>
      <div style={filterStyle}>
        <LottieComp animationData={animationData} loop={loop} autoplay style={{ width: '100%', height: '100%' }} />
      </div>
    </span>
  );
};

export default memo(LottieLoader);
