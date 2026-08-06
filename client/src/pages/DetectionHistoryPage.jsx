import React from 'react';
import HistoryPage from '../components/HistoryPage';

export default function DetectionHistoryPage() {
  return <HistoryPage onClose={() => window.history.back()} />;
}
