import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Zap, 
  Lock, 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  FileCheck, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  CheckCircle2,
  Globe,
  Award
} from 'lucide-react';

const FEATURES = [
  { icon: FileText, title: 'AI Text Classifier', desc: 'Detect ChatGPT, Claude 3.5, Gemini, Llama 3 & synthetic text generation with sentence-level heatmaps.' },
  { icon: ImageIcon, title: 'Deepfake Image Detector', desc: 'Identify Midjourney v6, DALL-E 3, Stable Diffusion & face swap manipulations down to pixel metadata.' },
  { icon: FileCheck, title: 'PDF Forensic Audit', desc: 'Verify PDF document integrity, font encoding anomalies, and digital signature tampering.' },
  { icon: Music, title: 'Synthetic Voice Clone', desc: 'Detect ElevenLabs voice clones, AI dubbing, and neural audio synthesis across 40+ languages.' },
  { icon: VideoIcon, title: 'Video Deepfake Analyzer', desc: 'Temporal and frame-by-frame facial artifact detection for high-definition video streams.' }
];

const TIMELINE_STEPS = [
  { step: '01', title: 'Upload Payload', desc: 'Drop any text, image, PDF, audio, or video file into the secure encrypted buffer.' },
  { step: '02', title: 'Metadata Extraction', desc: 'Analyze container structures, EXIF headers, spectral noise, and hash footprints.' },
  { step: '03', title: 'Neural Model Matrix', desc: 'Run ensemble classification across 12+ specialized TruthScan neural engines.' },
  { step: '04', title: 'Verification Report', desc: 'Receive instant probability scores, risk badges, PDF export, and watermark tokens.' }
];

const FAQS = [
  { q: 'How accurate is TruthLens AI?', a: 'TruthLens AI achieves a benchmark precision score of 99.4% across multimodal synthetic media detection by combining deep neural classifiers with forensic metadata analysis.' },
  { q: 'Does TruthLens AI support real-time API integrations?', a: 'Yes! TruthLens AI exposes high-throughput REST and WebSocket endpoints for enterprise platform integrations.' },
  { q: 'How are uploaded files handled?', a: 'All uploaded files are processed in ephemeral memory buffers and auto-deleted after forensic extraction, ensuring zero data retention compliance.' }
];

export default function LandingPage({ onGetStarted }) {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      {/* HERO SECTION */}
      <section style={{ padding: '80px 20px 60px 20px', textAlign: 'center', position: 'relative' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ maxWidth: '850px', margin: '0 auto' }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '9999px',
              background: 'var(--bg-glass-hover)',
              border: '1px solid var(--glass-border-glow)',
              color: 'var(--apple-accent-blue)',
              fontSize: '0.85rem',
              fontWeight: 800,
              marginBottom: '24px'
            }}
          >
            <Sparkles style={{ width: 16, height: 16 }} />
            <span>Enterprise Multimodal AI Authenticity Platform</span>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontSize: 'clamp(2.5rem, 5vw, 4.2rem)',
              fontWeight: 900,
              lineHeight: '1.1',
              letterSpacing: '-0.03em',
              color: 'var(--text-primary)',
              marginBottom: '20px'
            }}
          >
            Verify Content Authenticity with{' '}
            <span style={{ background: 'var(--apple-accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Precision AI Forensics
            </span>
          </h1>

          {/* Subheading */}
          <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '36px', maxWidth: '680px', margin: '0 auto 36px auto' }}>
            Instantly detect AI-generated Text, Deepfake Images, Tampered PDFs, Synthesized Voice Clones, and Video Manipulations using TruthScan neural classifiers.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={onGetStarted}
              className="apple-primary-button"
              style={{ padding: '16px 36px', fontSize: '1.05rem', borderRadius: '20px' }}
            >
              <span>Launch AI Audit Panel</span>
              <ArrowRight style={{ width: 20, height: 20 }} />
            </button>
          </div>
        </motion.div>

        {/* TRUST STATS GRID */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            maxWidth: '1000px',
            margin: '60px auto 0 auto'
          }}
        >
          {[
            { metric: '99.4%', label: 'Forensic Precision Score' },
            { metric: '50M+', label: 'Synthetic Files Audited' },
            { metric: '<1.8s', label: 'Average Processing Speed' },
            { metric: '100%', label: 'Zero Retention Compliance' }
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -4 }}
              className="glass-card"
              style={{ padding: '20px', borderRadius: '20px', textAlign: 'center' }}
            >
              <div style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--apple-accent-blue)' }}>
                {stat.metric}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px' }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURES MATRIX */}
      <section style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Multimodal Forensic Capabilities
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Powered by specialized deep learning engines tailored for every media format
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -6 }}
                className="glass-card glass-card-interactive"
                style={{ padding: '28px', borderRadius: '24px' }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'var(--apple-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '20px' }}>
                  <Icon style={{ width: 24, height: 24 }} />
                </div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '8px' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
                  {feat.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* HOW IT WORKS TIMELINE */}
      <section style={{ padding: '60px 20px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            How TruthLens AI Works
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Four steps to complete synthetic media verification
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {TIMELINE_STEPS.map((step, idx) => (
            <div key={idx} className="glass-card" style={{ padding: '24px', borderRadius: '22px' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--apple-accent-blue)', opacity: 0.8, marginBottom: '12px' }}>
                {step.step}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                {step.title}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ ACCORDION */}
      <section style={{ padding: '60px 20px 100px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--text-primary)' }}>
            Frequently Asked Questions
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="glass-card" style={{ borderRadius: '18px', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  style={{ width: '100%', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', textAlign: 'left' }}
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp style={{ width: 20, height: 20 }} /> : <ChevronDown style={{ width: 20, height: 20 }} />}
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ padding: '0 20px 20px 20px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.6' }}
                    >
                      {faq.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
