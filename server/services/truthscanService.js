const axios = require('axios');
const FormData = require('form-data');
const path = require('path');

const HOSTS = {
  text: 'https://detect-text.truthscan.com',
  image: 'https://detect-image.truthscan.com',
  video: 'https://detect-video.truthscan.com',
  audio: 'https://detect-audio.truthscan.com',
  pdf: 'https://detect-text.truthscan.com'
};

function getApiKey() {
  const key = process.env.TRUTHSCAN_API_KEY;
  if (!key || key === 'your_key_here') {
    throw new Error('TRUTHSCAN_API_KEY is not configured in backend environment.');
  }
  return key;
}

function sanitizeFileName(fileName) {
  if (!fileName) return 'file';
  // Strip leading path, remove spaces and special characters per TruthScan specs
  const nameOnly = fileName.split(/[/\\]/).pop();
  return nameOnly.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
}

/**
 * Strict MIME type resolution matching TruthScan requirements
 */
function getStrictContentType(filename, defaultMime = 'application/octet-stream') {
  if (!filename) return defaultMime;
  const ext = path.extname(filename).toLowerCase();
  const mimeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.jfif': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.tiff': 'image/tiff',
    '.tif': 'image/tiff',
    '.heic': 'image/heic',
    '.heif': 'image/heif',
    '.avif': 'image/avif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.m4a': 'audio/m4a',
    '.flac': 'audio/flac',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
    '.mov': 'video/quicktime',
    '.avi': 'video/x-msvideo',
    '.mkv': 'video/x-matroska',
    '.webm': 'video/webm'
  };
  return mimeMap[ext] || defaultMime;
}

/**
 * Low-level Axios error handling wrapper
 */
function handleAxiosError(error) {
  if (error.response) {
    const data = error.response.data;
    const msg = (typeof data === 'object' && data !== null)
      ? (data.error || data.message || JSON.stringify(data))
      : data;
    return new Error(msg || `TruthScan API returned status ${error.response.status}`);
  }
  return new Error(error.message || 'Network error communicating with TruthScan');
}

/**
 * Shared helper for presigned URL uploads (Image, PDF, Audio)
 * Direct PUT request to S3/DigitalOcean Spaces object storage presigned URL.
 */
async function uploadToPresignedUrl(presignedUrl, buffer, contentType) {
  try {
    const headers = {
      'Content-Type': contentType || 'application/octet-stream'
    };
    headers['x-amz-acl'] = 'private';

    const response = await axios.put(presignedUrl, buffer, {
      headers,
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });
    console.log(`[Step 2: Upload PUT] contentType=${contentType} | status=${response.status}`);
    return response.status >= 200 && response.status < 300;
  } catch (error) {
    if (error.response && error.response.status === 403) {
      try {
        const retryRes = await axios.put(presignedUrl, buffer, {
          headers: { 'Content-Type': contentType || 'application/octet-stream' },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        });
        console.log(`[Step 2: Upload PUT Retry] contentType=${contentType} | status=${retryRes.status}`);
        return retryRes.status >= 200 && retryRes.status < 300;
      } catch (retryErr) {
        console.error('[Step 2: Upload PUT ERROR]', retryErr.message);
        throw handleAxiosError(retryErr);
      }
    }
    console.error('[Step 2: Upload PUT ERROR]', error.message);
    throw handleAxiosError(error);
  }
}

/**
 * Text Service
 */
const textService = {
  async detect(text, options = {}) {
    const key = getApiKey();
    try {
      const payload = {
        text,
        key,
        model: options.model || 'xlm_ud_detector',
        retry_count: 0,
        generate_analysis_details: options.generate_analysis_details !== false
      };
      const res = await axios.post(`${HOSTS.text}/detect`, payload);
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },
  async query(id) {
    const key = getApiKey();
    try {
      const res = await axios.post(`${HOSTS.text}/query`, { id, key });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }
};

/**
 * Image Service
 */
const imageService = {
  async presign(fileName) {
    const key = getApiKey();
    const cleanName = sanitizeFileName(fileName);
    try {
      const res = await axios.get(`${HOSTS.image}/get-presigned-url`, {
        params: { file_name: cleanName },
        headers: { apikey: key, key: key }
      });
      console.log(`[Step 1: Presign] file_name=${cleanName} | status=${res.status} | response=`, res.data);
      return res.data;
    } catch (err) {
      console.error('[Step 1: Presign ERROR]', err.message);
      throw handleAxiosError(err);
    }
  },
  upload: uploadToPresignedUrl,
  async detect(url, options = {}) {
    const key = getApiKey();
    try {
      const payload = {
        key,
        url,
        generate_preview: options.generate_preview !== false,
        generate_analysis_details: options.generate_analysis_details !== false,
        generate_heatmap: options.generate_heatmap !== false,
        model: options.model || 'generic'
      };
      const res = await axios.post(`${HOSTS.image}/detect`, payload);
      console.log(`[Step 3: Detect POST] url=${url} | status=${res.status} | response=`, res.data);
      return res.data;
    } catch (err) {
      console.error('[Step 3: Detect POST ERROR]', err.message);
      throw handleAxiosError(err);
    }
  },
  async query(id) {
    const key = getApiKey();
    try {
      const res = await axios.post(`${HOSTS.image}/query`, { id, key });
      console.log(`[Step 4: Query POST] id=${id} | status=${res.status} | response=`, res.data);
      return res.data;
    } catch (err) {
      console.error('[Step 4: Query POST ERROR]', err.message);
      throw handleAxiosError(err);
    }
  }
};

/**
 * PDF Service
 */
const pdfService = {
  async presign(fileName) {
    const key = getApiKey();
    const cleanName = sanitizeFileName(fileName);
    try {
      const res = await axios.get(`${HOSTS.pdf}/get-presigned-url`, {
        params: { file_name: cleanName, expiration: 3600 },
        headers: { apikey: key, key: key }
      });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },
  upload: uploadToPresignedUrl,
  async detect(url, options = {}) {
    const key = getApiKey();
    try {
      const payload = {
        key,
        url,
        model: options.model || 'pdf_detector/v4'
      };
      const res = await axios.post(`${HOSTS.pdf}/detect-pdf`, payload);
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },
  async query(id) {
    const key = getApiKey();
    try {
      const res = await axios.post(`${HOSTS.pdf}/query`, { id, key });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }
};

/**
 * Audio Service
 */
const audioService = {
  async presign(fileName) {
    const key = getApiKey();
    const cleanName = sanitizeFileName(fileName);
    try {
      const res = await axios.get(`${HOSTS.audio}/get-presigned-url`, {
        params: { file_name: cleanName },
        headers: { apikey: key, key: key }
      });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },
  upload: uploadToPresignedUrl,
  async detect(url, analyzeUpToSeconds) {
    const key = getApiKey();
    const body = {
      key,
      url,
      document_type: 'Audio'
    };
    if (analyzeUpToSeconds && !isNaN(Number(analyzeUpToSeconds))) {
      body.analyzeUpToSeconds = Number(analyzeUpToSeconds);
    }
    try {
      const res = await axios.post(`${HOSTS.audio}/detect`, body);
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },
  async query(id) {
    const key = getApiKey();
    try {
      const res = await axios.post(`${HOSTS.audio}/query`, { id, key });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }
};

/**
 * Video Service
 */
const videoService = {
  async detectFile(buffer, originalName, mimeType, model = 'generic') {
    const key = getApiKey();
    const cleanName = sanitizeFileName(originalName);
    const form = new FormData();
    form.append('file', buffer, { filename: cleanName, contentType: mimeType || 'video/mp4' });
    if (model) {
      form.append('model', model);
    }

    try {
      const res = await axios.post(`${HOSTS.video}/detect-file`, form, {
        headers: {
          ...form.getHeaders(),
          key: key,
          apikey: key
        },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },
  async detectUrl(url, model = 'generic') {
    const key = getApiKey();
    try {
      const res = await axios.post(`${HOSTS.video}/detect`, { url, key, model });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  },
  async query(id) {
    const key = getApiKey();
    try {
      const res = await axios.post(`${HOSTS.video}/query`, { id, key });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }
};

/**
 * Credits Check Service
 */
const creditsService = {
  async check(type) {
    const key = getApiKey();
    const host = HOSTS[type];
    if (!host) throw new Error(`Invalid content type '${type}' for credits check`);

    try {
      const res = await axios.get(`${host}/check-user-credits`, {
        params: { key },
        headers: { apikey: key, key: key }
      });
      return res.data;
    } catch (err) {
      throw handleAxiosError(err);
    }
  }
};

module.exports = {
  text: textService,
  image: imageService,
  pdf: pdfService,
  audio: audioService,
  video: videoService,
  credits: creditsService,
  uploadToPresignedUrl,
  sanitizeFileName,
  getStrictContentType,
  HOSTS
};
