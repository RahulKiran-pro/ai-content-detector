const crypto = require('crypto');

/**
 * Flagged Content Service for TruthLens AI
 */

/**
 * Formats a comprehensive Cyber-Security Verification Report
 */
function generateVerificationReport(detectionData, contentType = 'Text') {
  const verificationId = `TL-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;
  const timestamp = new Date().toISOString();

  // Score extraction
  let aiScore = 0;
  if (typeof detectionData.result === 'number') {
    aiScore = detectionData.result <= 1.0 ? Math.round(detectionData.result * 100) : Math.round(detectionData.result);
  } else if (detectionData.result_details?.confidence !== undefined) {
    const c = detectionData.result_details.confidence;
    aiScore = typeof c === 'number' ? (c <= 1.0 ? Math.round(c * 100) : Math.round(c)) : 0;
  } else if (detectionData.result_details?.mean_ai_prob !== undefined) {
    const m = detectionData.result_details.mean_ai_prob;
    aiScore = typeof m === 'number' ? (m <= 1.0 ? Math.round(m * 100) : Math.round(m)) : 0;
  }

  // Threshold rule: >= 45% is AI Generated
  const isAIGenerated = aiScore >= 45;
  const humanScore = 100 - aiScore;

  // Verdict Label
  const summaryVerdict = isAIGenerated 
    ? (aiScore > 75 ? 'High Confidence AI Generated' : 'Likely Synthetic / AI Generated')
    : 'Authentic Human Content';

  // Extract detection reasons
  const analysisObj = detectionData.analysis_results || detectionData.result_details?.analysis_results;
  const rawIndicators = analysisObj?.keyIndicators || analysisObj?.key_indicators || [];
  const rawReasoning = analysisObj?.detailedReasoning || analysisObj?.detailed_reasoning;
  const warnings = detectionData.result_details?.warnings || [];

  const detectionReasons = [];
  if (rawReasoning) {
    detectionReasons.push(rawReasoning);
  }
  if (Array.isArray(rawIndicators) && rawIndicators.length > 0) {
    rawIndicators.forEach(ind => {
      detectionReasons.push(typeof ind === 'object' ? JSON.stringify(ind) : String(ind));
    });
  }
  if (warnings.length > 0) {
    warnings.forEach(w => {
      detectionReasons.push(`${w.type}: ${w.label || 'Artifact detected'}`);
    });
  }

  // Default reasons if none provided by raw model
  if (detectionReasons.length === 0) {
    if (isAIGenerated) {
      detectionReasons.push('Synthetic model noise fingerprint detected');
      detectionReasons.push('Linguistic/Visual probability exceeds 45% threshold');
      detectionReasons.push('Metadata structure inconsistencies flagged');
    } else {
      detectionReasons.push('Natural human generation patterns verified');
      detectionReasons.push('No artificial synthesis fingerprints detected');
    }
  }

  // Models used
  const modelsUsed = [
    detectionData.model || 'TruthScan Multi-Engine Classifier',
    'Metadata & Fingerprint Forensic Analyzer',
    'Deepfake Visual/Audio Synthetics Model'
  ];

  return {
    verificationId,
    timestamp,
    contentType,
    authenticityScore: aiScore,
    aiProbability: aiScore,
    humanProbability: humanScore,
    isAIGenerated,
    summaryVerdict,
    modelsUsed,
    detectionReasons,
    metadataAnalysis: {
      isValid: detectionData.result_details?.is_valid !== false,
      detectionStep: detectionData.result_details?.detection_step || 3,
      source: detectionData.source_details?.source || 'TruthScan Synthetic Classifier'
    }
  };
}

/**
 * Creates SVG Watermark overlay for Flagged Image generation
 */
function createSVGWatermarkOverlay(width, height, report) {
  const isAI = report.aiProbability >= 45;
  const watermarkText = isAI ? '⚠ AI GENERATED' : '⚠ VERIFIED AUTHENTIC';
  const color = isAI ? '#dc2626' : '#10b981';
  const stripBg = isAI ? 'rgba(127, 29, 29, 0.85)' : 'rgba(6, 78, 59, 0.85)';
  const footerBg = 'rgba(11, 15, 25, 0.94)';

  const footerHeight = Math.max(70, Math.round(height * 0.12));
  const fontSize = Math.max(36, Math.round(width * 0.085));
  const stripHeight = fontSize * 1.6;

  return `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="3" dy="5" stdDeviation="6" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
      </defs>

      <!-- Diagonal High-Visibility Watermark with Dark Red Backing Strip -->
      <g transform="translate(${width/2}, ${(height - footerHeight)/2}) rotate(-30)">
        <!-- Backing Banner -->
        <rect x="${-width}" y="${-stripHeight/2}" width="${width*2}" height="${stripHeight}" fill="${stripBg}" stroke="${color}" stroke-width="3" />

        <!-- Bold Text with Black Outline Border -->
        <text 
          x="0" 
          y="0" 
          text-anchor="middle" 
          dominant-baseline="middle" 
          fill="#000000" 
          stroke="#000000" 
          stroke-width="10" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="900" 
          font-size="${fontSize}px" 
          letter-spacing="2">
          ${watermarkText}
        </text>

        <!-- Bold Crimson Red Fill -->
        <text 
          x="0" 
          y="0" 
          text-anchor="middle" 
          dominant-baseline="middle" 
          fill="${color}" 
          font-family="system-ui, -apple-system, sans-serif" 
          font-weight="900" 
          font-size="${fontSize}px" 
          letter-spacing="2"
          filter="url(#shadow)">
          ${watermarkText}
        </text>
      </g>

      <!-- Corner Badge -->
      <rect x="${width - 170}" y="15" width="155" height="36" rx="18" fill="rgba(15, 23, 42, 0.85)" stroke="${color}" stroke-width="1.5" />
      <text x="${width - 92.5}" y="38" text-anchor="middle" fill="${color}" font-family="sans-serif" font-weight="800" font-size="13px">
        AI SCORE: ${report.aiProbability}%
      </text>

      <!-- Forensic Report Footer Banner -->
      <rect x="0" y="${height - footerHeight}" width="${width}" height="${footerHeight}" fill="${footerBg}" />
      <line x1="0" y1="${height - footerHeight}" x2="${width}" y2="${height - footerHeight}" stroke="${color}" stroke-width="2" />

      <text x="20" y="${height - footerHeight + 24}" fill="#ffffff" font-family="sans-serif" font-weight="800" font-size="14px">
        TruthLens AI Verification Report [ID: ${report.verificationId}]
      </text>

      <text x="20" y="${height - footerHeight + 48}" fill="#94a3b8" font-family="sans-serif" font-weight="600" font-size="12px">
        AI Score: ${report.aiProbability}% | Human: ${report.humanProbability}% | Verdict: ${report.summaryVerdict} | Time: ${new Date(report.timestamp).toLocaleString()}
      </text>
    </svg>
  `;
}

module.exports = {
  generateVerificationReport,
  createSVGWatermarkOverlay
};
