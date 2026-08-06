import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import AIDetectionPanel from '../components/AIDetectionPanel';

export default function DetectorPage() {
  const location = useLocation();

  // Extract detector type from pathname
  const pathParts = location.pathname.split('/');
  const detectorType = pathParts[pathParts.length - 1] || 'text';

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      <AIDetectionPanel initialType={detectorType} />
    </div>
  );
}
