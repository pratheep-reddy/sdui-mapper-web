import Link from 'next/link';
import TemplateGrid from '@/components/TemplateGrid';
import { API_ENDPOINTS } from '@/lib/constants';

// Force dynamic rendering since we need to fetch templates at runtime
export const dynamic = 'force-dynamic';

interface Template {
  templateId: string;
  templateName: string;
  templateType: string;
  staticTemplateJson: any;
  dynamicTemplateJson: any;
}

async function getTemplates(): Promise<Template[]> {
  try {
    const response = await fetch(API_ENDPOINTS.templates.list(), {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }
    
    const templatesData = await response.json();
    return templatesData;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export default async function MapperPage() {
  const templates = await getTemplates();

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 mb-0.5">Templates</h1>
            <p className="text-sm text-gray-500">Manage your SDUI templates</p>
          </div>
          {templates.length > 0 && (
            <Link
              href="/mapper/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-opacity shadow-md"
              style={{ backgroundColor: '#e75e27' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Template
            </Link>
          )}
        </div>

        {/* Templates Grid */}
        {templates.length > 0 ? (
          <TemplateGrid templates={templates} />
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-12 h-12 mb-4 flex items-center justify-center bg-gray-50 rounded-full">
              <svg 
                className="w-6 h-6 text-gray-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No templates</h3>
            <p className="text-sm text-gray-500 mb-6">Get started by creating your first template</p>
            <Link
              href="/mapper/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Template
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

