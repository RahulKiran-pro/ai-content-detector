import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GlobalLoader({ onComplete }) {
  const [text, setText] = useState('');
  const fullText = 'Initializing TruthLens AI Multi-Modal Engine...';

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      setText(fullText.substring(0, index));
      index++;
      if (index > fullText.length) {
        clearInterval(timer);
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 600);
      }
    }, 45);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: '#030712',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Background Aurora Mesh & Grid */}
      <div className="aurora-bg">
        <div className="aurora-blob-1" />
        <div className="aurora-blob-2" />
        <div className="aurora-blob-3" />
      </div>

      {/* Cyber Grid Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(rgba(56, 189, 248, 0.15) 1px, transparent 1px), radial-gradient(rgba(129, 140, 248, 0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
          opacity: 0.6
        }}
      />

      {/* Central Pulsing Neon Ring Logo */}
      <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px dashed rgba(56, 189, 248, 0.6)',
            boxShadow: '0 0 30px rgba(56, 189, 248, 0.3)'
          }}
        />

        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: '10px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(56, 189, 248, 0.3) 0%, rgba(129, 140, 248, 0) 70%)',
            border: '1px solid rgba(129, 140, 248, 0.5)'
          }}
        />

        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '20px',
            background: 'var(--apple-accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            color: '#ffffff',
            fontSize: '1.8rem',
            boxShadow: '0 0 40px rgba(56, 189, 248, 0.6)',
            border: '1.5px solid rgba(255, 255, 255, 0.4)',
            zIndex: 10
          }}
        >
          TL
        </div>
      </div>

      {/* Typing Subtitle */}
      <div style={{ textAlign: 'center', zIndex: 10 }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '8px' }}>
          TruthLens <span style={{ color: '#38bdf8' }}>AI</span>
        </h2>
        <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'var(--font-mono)', minHeight: '24px' }}>
          {text}<span style={{ animation: 'blink 0.8s infinite' }}>|</span>
        </div>
      </div>
    </motion.div>
  );
}
