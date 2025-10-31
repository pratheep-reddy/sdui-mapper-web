'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DivKitRenderer from '@/components/DivKitRenderer';
import { API_ENDPOINTS } from '@/lib/constants';

type DeviceType = 'mobile' | 'tablet' | 'web';

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const templateId = params.logId as string; // Keep logId param name for backward compatibility
  
  const [templateData, setTemplateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [device, setDevice] = useState<DeviceType>('mobile');

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(API_ENDPOINTS.sdui.component(templateId));
        debugger;
        if (!response.ok) {
          throw new Error('Failed to fetch template');
        }
        
        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || 'Template not found');
        }
        
        setTemplateData(result.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template');
      } finally {
        setLoading(false);
      }
    };

    if (templateId) {
      fetchTemplate();
    }
  }, [templateId]);

  const getDeviceWidth = () => {
    switch (device) {
      case 'mobile':
        return 'max-w-[375px]';
      case 'tablet':
        return 'max-w-[768px]';
      case 'web':
        return 'max-w-full';
      default:
        return 'max-w-[375px]';
    }
  };

  const getDeviceHeight = () => {
    switch (device) {
      case 'mobile':
        return 'min-h-[667px] max-h-[844px]';
      case 'tablet':
        return 'min-h-[1024px] max-h-[1366px]';
      case 'web':
        return 'min-h-[600px]';
      default:
        return 'min-h-[667px] max-h-[844px]';
    }
  };

  const handleDownloadJson = () => {
    if (!templateData) return;

    // Create a blob with the JSON data
    const jsonString = JSON.stringify(templateData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary link element and trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `template-${templateId}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center max-w-md">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error Loading Preview</h2>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <h1 className="text-xl font-bold text-slate-900">
              {templateData?.card?.log_id?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) || 'Preview'}
            </h1>

            <div className="flex items-center space-x-3">
              {/* Download JSON Button */}
              <button
                onClick={handleDownloadJson}
                disabled={!templateData}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2 hover:bg-slate-50"
                style={{ 
                  borderColor: '#e75e27', 
                  color: '#e75e27'
                }}
                title="Download Generated JSON"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download JSON
              </button>

              {/* Device Toggle */}
              <div className="flex items-center space-x-2 bg-slate-100 rounded-lg p-1">
              <button
                onClick={() => setDevice('mobile')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  device === 'mobile'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Mobile (375px)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  device === 'tablet'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Tablet (768px)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </button>
              <button
                onClick={() => setDevice('web')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  device === 'web'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Web (Full Width)"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="container mx-auto px-6 py-12 flex justify-center">
        <div className={`w-full ${getDeviceWidth()} transition-all duration-300`}>
          <div className={`bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col ${getDeviceHeight()}`}>
            {/* Device Frame Header (for mobile and tablet) */}
            {device !== 'web' && (
              <div className="bg-slate-900 px-4 py-3 flex items-center justify-center flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-16 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="bg-white overflow-y-auto flex-1">
              <DivKitRenderer data={templateData} />
            </div>
          </div>

          {/* Device Info */}
          <div className="mt-4 text-center text-sm text-slate-500">
            Viewing in {device} mode
            {device === 'mobile' && ' (375px × 667-844px)'}
            {device === 'tablet' && ' (768px × 1024-1366px)'}
            {device === 'web' && ' (Full Width)'}
          </div>
        </div>
      </div>
    </div>
  );
}

