import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../config/api';
import { useToast } from './Toast';
import AIPipelineLoader from './AIPipelineLoader';
import { 
  FileText, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Music, 
  FileCheck, 
  Upload, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  RefreshCw,
  Coins,
  ShieldCheck,
  Zap,
  Info,
  AlertTriangle,
  Download,
  Share2,
  Copy,
  Flag,
  Check,
  ShieldAlert,
  X,
  File,
  ChevronDown,
  ChevronUp,
  Cpu,
  Clock,
  WifiOff
} from 'lucide-react';
import FlaggedMediaViewer from './FlaggedMediaViewer';
import VerificationReportModal from './VerificationReportModal';

const CONTENT_TYPES_MAP = {
  text: { id: 'text', label: 'AI Text Analysis', icon: FileText, desc: 'Detect ChatGPT, Claude 3.5, Gemini & AI text generation', accept: null },
  image: { id: 'image', label: 'Image Deepfake Detector', icon: ImageIcon, desc: 'Identify AI-generated images & Midjourney art (≤10MB)', accept: '.jpg,.jpeg,.png,.webp,.gif' },
  pdf: { id: 'pdf', label: 'PDF Forensic Audit', icon: FileCheck, desc: 'Audit PDF authenticity & document tampering (≤2MB)', accept: '.pdf' },
  audio: { id: 'audio', label: 'Synthetic Audio Detector', icon: Music, desc: 'Detect ElevenLabs voice clones & synthesized speech (≤25MB)', accept: '.mp3,.wav,.m4a,.aac,.flac' },
  video: { id: 'video', label: 'Video Deepfake Analyzer', icon: VideoIcon, desc: 'Analyze facial & temporal video manipulation (≤100MB)', accept: '.mp4,.mov,.avi,.mkv,.webm' }
};

import { useLocation } from 'react-router-dom';

export default function AIDetectionPanel() {
  const location = useLocation();
  // Determine current tab from URL path
  const pathTab = location.pathname.split('/').pop();
  const currentTab = pathTab && pathTab !== 'dashboard' ? pathTab : 'text';
  const activeTabObj = CONTENT_TYPES_MAP[currentTab] || CONTENT_TYPES_MAP.text;
  const activeTab = currentTab; // alias for backward compatibility within this file

  const { showToast } = useToast();
  // Removed previous activeTabObj definition; now using activeTabResolved
  
  // Inputs
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [useVideoUrl, setUseVideoUrl] = useState(false);

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);

  // Execution & Polling State
  const [taskId, setTaskId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [pollStatus, setPollStatus] = useState(null); // 'pending' | 'analyzing' | 'done' | 'failed'
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Expandable sections in results
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(true);

  // Flagged Content & Verification Report State
  const [showFlaggedViewer, setShowFlaggedViewer] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [verificationReport, setVerificationReport] = useState(null);
  const [copiedReport, setCopiedReport] = useState(false);

  // Credits state per type
  const [credits, setCredits] = useState(null);
  const [loadingCredits, setLoadingCredits] = useState(false);

  const fileInputRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const stepTimerRef = useRef(null);

  // Network Offline Listener
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch credits whenever active tab changes
  useEffect(() => {
    fetchCredits(currentTab);
    resetFormState();
  }, [currentTab]);

  // Handle File Preview Generation
  useEffect(() => {
    if (!selectedFile) {
      setFilePreviewUrl(null);
      return;
    }
    if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setFilePreviewUrl(null);
    }
  }, [selectedFile]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  const resetFormState = () => {
    setTextContent('');
    setSelectedFile(null);
    setFilePreviewUrl(null);
    setVideoUrl('');
    setTaskId(null);
    setIsSubmitting(false);
    setCurrentStepIndex(0);
    setPollStatus(null);
    setResultData(null);
    setErrorMessage(null);
    setShowFlaggedViewer(false);
    setShowReportModal(false);
    setVerificationReport(null);
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (stepTimerRef.current) {
      clearInterval(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  };

  const fetchCredits = async (type) => {
    setLoadingCredits(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/detect/credits/${type}`);
      if (res.ok) {
        const text = await res.text();
        const data = text ? JSON.parse(text) : {};
        setCredits(data.credits ?? data.remaining_credits ?? data.balance ?? data);
      } else {
        setCredits(null);
      }
    } catch (err) {
      setCredits(null);
    } finally {
      setLoadingCredits(false);
    }
  };

  const fetchVerificationReport = async (data, type) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/flagged/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ detectionData: data, contentType: type })
      });
      if (res.ok) {
        const reportData = await res.json();
        if (reportData) {
          setVerificationReport(reportData);
          if (reportData.aiProbability >= 45) {
            confetti({ particleCount: 45, spread: 70, origin: { y: 0.7 } });
          }
        }
      }
    } catch (e) {
      console.warn('Failed to fetch verification report:', e);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setErrorMessage(null);
    if (currentTab === 'pdf' && file.size > 2 * 1024 * 1024) {
      const msg = 'PDF size exceeds 2MB limit. Please upload a smaller PDF document.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }
    if (currentTab === 'image' && file.size > 10 * 1024 * 1024) {
      const msg = 'Image file exceeds 10MB limit.';
      setErrorMessage(msg);
      showToast(msg, 'error');
      return;
    }
    setSelectedFile(file);
    showToast(`Loaded ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`, 'info');
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const isJobFinished = (data) => {
    if (!data) return false;
    const status = (data.status || data.state || '').toLowerCase();
    if (status === 'done' || status === 'completed') return true;
    if (status === 'failed' || status === 'error') return false;
    if (typeof data.result === 'number' && data.result !== null) return true;
    if (typeof data.score === 'number' && data.score !== null) return true;
    return false;
  };

  const startProgressSimulation = () => {
    setCurrentStepIndex(0);
    stepTimerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 6) return prev + 1;
        return prev;
      });
    }, 1500);
  };

  const startPolling = (id, type) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    setPollStatus('pending');
    startProgressSimulation();

    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/detect/status/${type}/${id}`);
        const text = await res.text();
        let data = {};
        try {
          data = text ? JSON.parse(text) : {};
        } catch (e) {
          data = { error: `Server response parse error (${res.status})` };
        }

        if (!res.ok) {
          const msg = data.error || 'Status check failed';
          setErrorMessage(msg);
          setPollStatus('failed');
          showToast(msg, 'error');
          clearInterval(pollIntervalRef.current);
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          return;
        }

        const currentStatus = (data.status || data.state || 'pending').toLowerCase();
        setPollStatus(currentStatus);

        if (isJobFinished(data)) {
          setResultData(data);
          setPollStatus('done');
          setCurrentStepIndex(6);
          clearInterval(pollIntervalRef.current);
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          fetchCredits(type);
          fetchVerificationReport(data, type);
          showToast('Forensic Analysis Completed!', 'success');
        } else if (currentStatus === 'failed' || currentStatus === 'error') {
          const msg = data.error || data.result_details?.error_message || 'TruthScan analysis task failed.';
          setErrorMessage(msg);
          setPollStatus('failed');
          showToast(msg, 'error');
          clearInterval(pollIntervalRef.current);
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
        }
      } catch (err) {
        setErrorMessage(err.message || 'Network error during status check.');
        setPollStatus('failed');
        showToast('Network error during status check', 'error');
        clearInterval(pollIntervalRef.current);
        if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      }
    }, 2200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isOffline) {
      showToast('You are currently offline. Please check your internet connection.', 'warning');
      return;
    }

    setErrorMessage(null);
    setResultData(null);
    setPollStatus(null);
    setIsSubmitting(true);

    try {
      let url = `${API_BASE_URL}/api/detect/${currentTab}`;
      let options = {};

      if (currentTab === 'text') {
        if (!textContent.trim()) {
          throw new Error('Please enter text content to analyze.');
        }
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: textContent })
        };
      } else if (currentTab === 'video' && useVideoUrl) {
        if (!videoUrl.trim() || !videoUrl.startsWith('http')) {
          throw new Error('Please provide a valid video URL (e.g. https://example.com/video.mp4).');
        }
        options = {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: videoUrl.trim() })
        };
      } else {
        if (!selectedFile) {
          throw new Error(`Please select a ${currentTab.toUpperCase()} file to upload.`);
        }
        const formData = new FormData();
        formData.append('file', selectedFile);
        options = { method: 'POST', body: formData };
      }

      const res = await fetch(url, options);
      const text = await res.text();
      let data = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch (err) {
        data = { error: `Server error response (${res.status})` };
      }

      if (!res.ok) {
        throw new Error(data.error || `Analysis request failed with status ${res.status}`);
      }

      if (data.task_id || data.id) {
        const id = data.task_id || data.id;
        setTaskId(id);
        startPolling(id, currentTab);
      } else if (isJobFinished(data)) {
        setResultData(data);
        setPollStatus('done');
        fetchCredits(currentTab);
        fetchVerificationReport(data, currentTab);
        showToast('Forensic Analysis Completed!', 'success');
      } else {
        setResultData(data);
        setPollStatus('done');
        fetchCredits(currentTab);
        fetchVerificationReport(data, currentTab);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred submitting the task.');
      showToast(err.message || 'Task submission failed', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAiScore = () => {
    if (!resultData) return 0;
    if (typeof resultData.result === 'number') return Math.round(resultData.result);
    if (typeof resultData.score === 'number') return Math.round(resultData.score);
    if (resultData.result_details?.ai_probability) return Math.round(resultData.result_details.ai_probability * 100);
    if (verificationReport?.aiProbability) return verificationReport.aiProbability;
    return 0;
  };

  const aiScore = calculateAiScore();
  const humanScore = 100 - aiScore;

  const getRiskLevel = (score) => {
    if (score >= 80) return { label: 'CRITICAL AI RISK', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
    if (score >= 45) return { label: 'MODERATE AI RISK', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
    if (score >= 20) return { label: 'LOW AI RISK', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' };
    return { label: 'AUTHENTIC MEDIA', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  };

  const risk = getRiskLevel(aiScore);

  const copyResultReport = () => {
    const reportText = `TruthLens AI Forensic Audit Summary\nVerdict: ${risk.label}\nAI Probability: ${aiScore}%\nHuman Probability: ${humanScore}%\nVerification ID: ${verificationReport?.verificationId || taskId || 'N/A'}`;
    navigator.clipboard.writeText(reportText);
    setCopiedReport(true);
    showToast('Report copied to clipboard', 'success');
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const IconComponent = activeTabObj.icon;

  return (
    <div style={{ width: '100%' }}>
      {/* Offline Alert Banner */}
      {isOffline && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '12px 18px',
            borderRadius: '16px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#ef4444',
            fontSize: '0.88rem',
            fontWeight: 700,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <WifiOff style={{ width: 18, height: 18 }} />
          <span>You are currently offline. Please restore internet connectivity to perform AI authenticity audits.</span>
        </motion.div>
      )}

      {/* Main Analysis Card (NO TOP TAB BAR - FULL WIDTH) */}
      <div className="glass-card" style={{ padding: '32px', borderRadius: '28px', width: '100%' }}>
        {/* Detector Header Banner */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ padding: '12px', borderRadius: '16px', background: 'var(--apple-accent-gradient)', color: '#ffffff' }}>
              <IconComponent style={{ width: 26, height: 26 }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                {activeTabObj.label}
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                {activeTabObj.desc}
              </p>
            </div>
          </div>

          <div
            style={{
              padding: '8px 16px',
              borderRadius: '9999px',
              background: 'var(--bg-dropzone)',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.85rem',
              fontWeight: 800,
              color: 'var(--text-secondary)'
            }}
          >
            <Coins style={{ width: 16, height: 16, color: '#f59e0b' }} />
            <span>Balance: {loadingCredits ? '...' : credits !== null ? `${credits} credits` : 'Unlimited'}</span>
          </div>
        </div>

        {/* FORM INPUT AREA */}
        <form onSubmit={handleSubmit}>
          {currentTab === 'text' ? (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Enter Text to Analyze
                </label>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  {textContent.length} characters • {textContent.trim() ? textContent.trim().split(/\s+/).length : 0} words
                </span>
              </div>
              <textarea
                rows={8}
                placeholder="Paste blog post, article, essay, or generated response here for AI deepfake audit..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '18px',
                  borderRadius: '20px',
                  background: 'var(--bg-dropzone)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.98rem',
                  lineHeight: '1.6',
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>
          ) : currentTab === 'video' && useVideoUrl ? (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Remote Video URL
              </label>
              <input
                type="url"
                placeholder="https://example.com/deepfake-sample.mp4"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  borderRadius: '18px',
                  background: 'var(--bg-dropzone)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setUseVideoUrl(false)}
                style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--apple-accent-blue)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 700 }}
              >
                ← Switch to Direct File Upload
              </button>
            </div>
          ) : (
            <div style={{ marginBottom: '24px' }}>
              {/* DRAG & DROP ZONE */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  padding: '48px 24px',
                  borderRadius: '24px',
                  border: `2px dashed ${isDragging ? 'var(--apple-accent-blue)' : 'var(--glass-border)'}`,
                  background: isDragging ? 'var(--bg-dropzone-active)' : 'var(--bg-dropzone)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease',
                  position: 'relative'
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={activeTabObj.accept}
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {selectedFile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
                    {filePreviewUrl ? (
                      currentTab === 'image' ? (
                        <img
                          src={filePreviewUrl}
                          alt="Upload preview"
                          style={{ maxHeight: '200px', borderRadius: '16px', border: '1px solid var(--glass-border)', objectFit: 'contain' }}
                        />
                      ) : (
                        <video src={filePreviewUrl} controls style={{ maxHeight: '200px', borderRadius: '16px' }} />
                      )
                    ) : (
                      <div style={{ padding: '20px', borderRadius: '20px', background: 'var(--bg-glass-hover)', color: 'var(--apple-accent-blue)' }}>
                        <File style={{ width: 42, height: 42 }} />
                      </div>
                    )}

                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.05rem' }}>
                        {selectedFile.name}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || currentTab.toUpperCase()}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="apple-glass-button"
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        <X style={{ width: 16, height: 16 }} /> Remove File
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ width: '64px', height: '64px', borderRadius: '20px', background: 'var(--apple-accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px auto', color: '#fff' }}>
                      <Upload style={{ width: 28, height: 28 }} />
                    </div>
                    <h4 style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', marginBottom: '6px' }}>
                      Drag & Drop your {currentTab.toUpperCase()} file here
                    </h4>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                      or click to browse files ({activeTabObj.desc})
                    </p>
                  </div>
                )}
              </div>

              {currentTab === 'video' && !selectedFile && (
                <button
                  type="button"
                  onClick={() => setUseVideoUrl(true)}
                  style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--apple-accent-blue)', fontSize: '0.82rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  Or inspect via Video HTTP URL →
                </button>
              )}
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="submit"
              disabled={isSubmitting || pollStatus === 'pending' || pollStatus === 'analyzing' || isOffline}
              className="apple-primary-button"
              style={{ padding: '16px 32px', fontSize: '1.05rem', flex: 1, borderRadius: '18px' }}
            >
              {isSubmitting || pollStatus === 'pending' || pollStatus === 'analyzing' ? (
                <>
                  <Loader2 style={{ width: 22, height: 22, animation: 'spin 1s linear infinite' }} />
                  <span>Running Forensic Analysis...</span>
                </>
              ) : (
                <>
                  <Sparkles style={{ width: 22, height: 22 }} />
                  <span>Analyze Authenticity</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* ERROR DISPLAY */}
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: '24px',
              padding: '18px',
              borderRadius: '18px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle style={{ width: 20, height: 20, flexShrink: 0 }} />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleSubmit}
              className="apple-glass-button"
              style={{ padding: '6px 14px', fontSize: '0.82rem', color: '#ef4444' }}
            >
              <RefreshCw style={{ width: 14, height: 14 }} /> Retry
            </button>
          </motion.div>
        )}

        {/* 7-STEP AI PIPELINE LOADING ANIMATION */}
        {(pollStatus === 'pending' || pollStatus === 'analyzing') && (
          <AIPipelineLoader currentStep={currentStepIndex} />
        )}

        {/* RESULTS PANEL */}
        {resultData && pollStatus === 'done' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              marginTop: '32px',
              padding: '28px',
              borderRadius: '24px',
              background: 'var(--bg-glass-hover)',
              border: `1.5px solid ${risk.color}`,
              boxShadow: `0 15px 45px ${risk.color}25`
            }}
          >
            {/* Verdict Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ padding: '6px 14px', borderRadius: '9999px', background: risk.bg, color: risk.color, fontWeight: 900, fontSize: '0.85rem', border: `1px solid ${risk.color}` }}>
                    {risk.label}
                  </div>
                </div>
                <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--text-primary)', marginTop: '8px' }}>
                  {resultData.verdict || resultData.result_details?.summary || (aiScore >= 45 ? 'AI Generated Synthetic Media' : 'Authentic Media Verified')}
                </h3>
              </div>

              {/* Action Toolbar */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={copyResultReport} className="apple-glass-button" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>
                  {copiedReport ? <Check style={{ width: 15, height: 15, color: '#10b981' }} /> : <Copy style={{ width: 15, height: 15 }} />}
                  <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                </button>

                <button onClick={() => setShowReportModal(true)} className="apple-primary-button" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  <Download style={{ width: 15, height: 15 }} />
                  <span>Full PDF Report</span>
                </button>
              </div>
            </div>

            {/* Circular Gauge & Probability Meter */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              {/* AI Gauge */}
              <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  AI Probability Score
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: risk.color, margin: '8px 0' }}>
                  {aiScore}%
                </div>
                <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${aiScore}%` }}
                    transition={{ duration: 1 }}
                    style={{ height: '100%', background: risk.color }}
                  />
                </div>
              </div>

              {/* Human Gauge */}
              <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Human Origin Probability
                </div>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: '#10b981', margin: '8px 0' }}>
                  {humanScore}%
                </div>
                <div style={{ height: '8px', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${humanScore}%` }}
                    transition={{ duration: 1 }}
                    style={{ height: '100%', background: '#10b981' }}
                  />
                </div>
              </div>
            </div>

            {/* Heatmap Text Preview (if text) */}
            {currentTab === 'text' && textContent && (
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles style={{ width: 16, height: 16, color: 'var(--apple-accent-blue)' }} /> Synthetic Highlight Heatmap
                </h4>
                <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', fontSize: '0.9rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                  <span style={{ background: aiScore >= 45 ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.15)', padding: '2px 6px', borderRadius: '6px', border: `1px solid ${aiScore >= 45 ? '#ef4444' : '#10b981'}` }}>
                    {textContent.substring(0, 300)}
                  </span>
                  {textContent.length > 300 ? '...' : ''}
                </div>
              </div>
            )}

            {/* Expandable Technical Details */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
              <button
                onClick={() => setShowDetailedExplanation(!showDetailedExplanation)}
                style={{ background: 'none', border: 'none', color: 'var(--apple-accent-blue)', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Cpu style={{ width: 16, height: 16 }} />
                <span>Forensic Engine Breakdown & Metadata</span>
                {showDetailedExplanation ? <ChevronUp style={{ width: 16, height: 16 }} /> : <ChevronDown style={{ width: 16, height: 16 }} />}
              </button>

              {showDetailedExplanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{ marginTop: '14px', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '8px' }}
                >
                  <div>Models: {verificationReport?.modelsUsed?.join(', ') || 'TruthScan Synthetic Classifier v4.2, Deepfake Vision Engine'}</div>
                  <div>Audit Timestamp: {new Date().toLocaleString()}</div>
                  <div>Task ID: {taskId || 'LOCAL-SYNC-01'}</div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Flagged Media Watermark Modal */}
      {showFlaggedViewer && (
        <FlaggedMediaViewer
          contentType={activeTab}
          originalFile={selectedFile}
          originalUrl={videoUrl}
          textContent={textContent}
          verificationData={resultData}
          report={verificationReport}
          onClose={() => setShowFlaggedViewer(false)}
        />
      )}

      {/* PDF Report Modal */}
      {showReportModal && (
        <VerificationReportModal
          report={verificationReport}
          resultData={resultData}
          contentType={activeTab}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
}
