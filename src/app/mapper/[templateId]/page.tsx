'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import DivKitRenderer from '@/components/DivKitRenderer';
import VariableEditor from '@/components/VariableEditor';
import { API_ENDPOINTS } from '@/lib/constants';

interface Template {
  templateId: string;
  templateName: string;
  templateType: 'static' | 'dynamic';
  staticTemplateJson: any;
  dynamicTemplateJson: any;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const templateId = params.templateId as string;

  const [template, setTemplate] = useState<Template | null>(null);
  const [previewData, setPreviewData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState('');

  useEffect(() => {
    fetchTemplateData();
  }, [templateId]);

  const fetchTemplateData = async () => {
    try {
      setLoading(true);
      const response = await fetch(API_ENDPOINTS.templates.getById(templateId));
      
      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }

      const result = await response.json();
      
      if (result.success) {
        setTemplate(result.data);
        // Fetch preview data after template is loaded - pass the actual templateId from the response
        fetchPreviewData(result.data.templateId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviewData = async (actualTemplateId?: string) => {
    const idToUse = actualTemplateId || template?.templateId;
    
    if (!idToUse) {
      console.error('No template ID available for preview');
      return;
    }
    
    try {
      setPreviewLoading(true);
      setPreviewError('');
      console.log('=== Fetching preview data ===');
      console.log('Route param (templateId):', templateId);
      console.log('Actual templateId from DB:', idToUse);
      console.log('URL:', API_ENDPOINTS.sdui.component(idToUse));
      
      const response = await fetch(API_ENDPOINTS.sdui.component(idToUse));
      console.log('Response status:', response.status);
      console.log('Response ok?:', response.ok);
      
      if (!response.ok) {
        throw new Error('Failed to fetch preview data');
      }

      const result = await response.json();
      console.log('Preview result:', result);
      
      if (result.success) {
        setPreviewData(result.data);
        console.log('Preview data set successfully');
      }
    } catch (err: any) {
      console.error('Preview fetch error:', err);
      setPreviewError(err.message || 'Failed to load preview');
      // Fallback to static template if preview fails
      if (template?.staticTemplateJson) {
        console.log('Using fallback: template.staticTemplateJson');
        setPreviewData(template.staticTemplateJson);
      }
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/mapper" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Templates
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <p className="text-red-600">{error || 'Template not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/mapper" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Templates
          </Link>

          <h1 className="text-lg font-semibold text-gray-900">{template.templateName}</h1>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchPreviewData()}
              disabled={previewLoading}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                borderColor: '#e75e27', 
                color: '#e75e27',
                backgroundColor: 'white'
              }}
            >
              <svg 
                className={`w-4 h-4 mr-2 ${previewLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
              {previewLoading ? 'Refreshing...' : 'Refresh Preview'}
            </button>

            <Link 
              href={`/preview/${templateId}`}
              className="inline-flex items-center px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
              style={{ backgroundColor: '#e75e27' }}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Full Preview
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6">
          {/* Left Side - Mobile Preview */}
          <div className="flex justify-center items-start">
            {/* Mobile Frame */}
            <div className="relative bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl" style={{ width: '340px', height: '720px' }}>
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-7 bg-gray-900 rounded-b-3xl z-10"></div>
              
              {/* Screen */}
              <div className="relative bg-white rounded-[2.5rem] overflow-hidden h-full">
                {/* Status Bar */}
                <div className="absolute top-0 left-0 right-0 h-12 bg-white z-10 flex items-center justify-between px-8 pt-2">
                  <span className="text-xs font-semibold text-gray-900">9:41</span>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <svg className="w-3 h-3 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-6 h-3 text-gray-900" fill="currentColor" viewBox="0 0 24 12">
                      <rect x="0" y="3" width="18" height="6" rx="2" />
                      <rect x="20" y="4" width="2" height="4" rx="1" />
                    </svg>
                  </div>
                </div>
                
                {/* Content Area - Scrollable */}
                <div className="absolute top-12 left-0 right-0 bottom-0 overflow-y-auto bg-white">
                  {previewLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-xs text-gray-500">Loading preview...</p>
                      </div>
                    </div>
                  ) : previewError ? (
                    <div className="flex items-center justify-center h-full p-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <svg className="w-8 h-8 text-red-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-xs text-red-700">{previewError}</p>
                      </div>
                    </div>
                  ) : previewData ? (
                    <DivKitRenderer data={previewData} />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-xs text-gray-400">No preview available</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Home Indicator */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-700 rounded-full"></div>
            </div>
          </div>

          {/* Right Side - Variable Editor */}
          <div className="bg-white rounded-lg border border-gray-200">
            <VariableEditor 
              variables={template.staticTemplateJson?.card?.variables || template.staticTemplateJson?.variables || template.staticTemplateJson?.template?.variables || []}
              templateData={{
                templateId: template.templateId,
                templateName: template.templateName,
                templateType: template.templateType,
                staticTemplateJson: template.staticTemplateJson,
                dynamicTemplateJson: template.dynamicTemplateJson,
              }}
              onPreviewRefresh={fetchPreviewData}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
