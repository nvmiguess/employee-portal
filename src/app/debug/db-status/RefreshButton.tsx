'use client';

import React from 'react';

export default function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
    >
      Refresh Status
    </button>
  );
} 