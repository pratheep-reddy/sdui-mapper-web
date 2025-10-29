'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

const EXAMPLE_JSON = `{
  "card": {
    "log_id": "example_card",
    "states": [
      {
        "state_id": 0,
        "div": {
          "type": "container",
          "orientation": "vertical",
          "items": [
            {
              "type": "text",
              "text": "Welcome to SDUI",
              "font_size": 24,
              "font_weight": "bold",
              "text_color": "#333333"
            },
            {
              "type": "text",
              "text": "This is an example template",
              "font_size": 16,
              "text_color": "#666666"
            }
          ]
        }
      }
    ]
  }
}`;

export default function NewTemplatePage() {
  const router = useRouter();
  const [templateName, setTemplateName] = useState('');
  const [templateJson, setTemplateJson] = useState('{\n  \n}');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadExample = () => {
    setTemplateJson(EXAMPLE_JSON);
    if (!templateName) {
      setTemplateName('Example Template');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      // Validate JSON
      let parsedJson;
      try {
        parsedJson = JSON.parse(templateJson);
      } catch (err) {
        setError('Invalid JSON format. Please check your JSON syntax.');
        setIsSubmitting(false);
        return;
      }

      // Call the API
      const response = await fetch('http://localhost:3001/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          templateName,
          templateJson: parsedJson,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create template');
      }

      const result = await response.json();
      
      if (result.success) {
        // Navigate back to templates list on success
        router.push('/mapper');
      } else {
        setError(result.message || 'Failed to create template');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while creating the template');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Link 
              href="/mapper" 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Create New Template</h1>
          </div>
          <p className="text-sm text-gray-500 ml-7">Define your SDUI template configuration</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Template Name */}
          <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700 mb-2">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              required
              placeholder="Enter template name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900 placeholder:text-gray-400"
            />
            <p className="mt-1 text-xs text-gray-500">
              A unique identifier will be auto-generated from this name
            </p>
          </div>

          {/* Template JSON */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="templateJson" className="block text-sm font-medium text-gray-700">
                Template JSON
              </label>
              <button
                type="button"
                onClick={loadExample}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Load Example
              </button>
            </div>
            <div className="border border-gray-300 rounded-md overflow-hidden">
              <MonacoEditor
                height="500px"
                language="json"
                theme="vs-light"
                value={templateJson}
                onChange={(value) => setTemplateJson(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 2,
                  formatOnPaste: true,
                  formatOnType: true,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              This JSON will be used for both static and dynamic templates
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting || !templateName.trim()}
              className="px-5 py-2.5 text-white text-sm font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-md"
              style={{ backgroundColor: isSubmitting || !templateName.trim() ? '#9ca3af' : '#e75e27' }}
            >
              {isSubmitting ? 'Creating...' : 'Create Template'}
            </button>
            <Link
              href="/mapper"
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

