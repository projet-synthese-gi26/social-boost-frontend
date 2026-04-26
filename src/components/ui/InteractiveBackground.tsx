'use client';

import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function InteractiveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Configuration de la fluidité (Spring)
  const springConfig = { damping: 25, stiffness: 150 };
  const mouseXSpring = useSpring(mouseX, springConfig);
  const mouseYSpring = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set((e.clientX / innerWidth) * 2 - 1);
      mouseY.set((e.clientY / innerHeight) * 2 - 1);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  const moveX = useTransform(mouseXSpring, [-1, 1], [20, -20]);
  const moveY = useTransform(mouseYSpring, [-1, 1], [20, -20]);
  const moveXSmall = useTransform(mouseXSpring, [-1, 1], [10, -10]);
  const moveYSmall = useTransform(mouseYSpring, [-1, 1], [10, -10]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-violet-900">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950 via-violet-900 to-indigo-950 opacity-90" />
        
        {/* Spot lumineux interactif */}
        <motion.div 
            className="absolute inset-0 z-10 opacity-30 mix-blend-soft-light pointer-events-none"
            style={{
                background: useTransform(
                    [mouseXSpring, mouseYSpring],
                    // LE CORRECTIF EST ICI : ([x, y]: number[])
                    ([x, y]: number[]) => `radial-gradient(600px circle at ${(x + 1) * 50}% ${(y + 1) * 50}%, rgba(139, 92, 246, 0.4), transparent 40%)`
                )
            }}
        />

        {/* Blob 1 */}
        <motion.div
            style={{ x: moveX, y: moveY }}
            animate={{ scale: [1, 1.1, 1], rotate: [0, 10, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-violet-600/30 rounded-full mix-blend-multiply filter blur-[120px]"
        />

        {/* Blob 2 */}
        <motion.div
            style={{ x: moveX, y: moveY }}
            animate={{ scale: [1, 1.2, 1], rotate: [0, -15, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-600/30 rounded-full mix-blend-multiply filter blur-[100px]"
        />

        {/* Blob 3 */}
        <motion.div
            style={{ x: moveXSmall, y: moveYSmall }}
            animate={{ x: [0, 30, 0], y: [0, -30, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-fuchsia-500/20 rounded-full mix-blend-overlay filter blur-[80px]"
        />

        {/* Texture Grain */}
        <div className="absolute inset-0 z-20 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'0 0 256 256\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}