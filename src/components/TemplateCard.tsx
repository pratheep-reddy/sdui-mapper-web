'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '@divkitframework/divkit/dist/client.css';

interface TemplateCardProps {
  templateId: string;
  templateName: string;
  staticTemplateJson: any;
  onDelete?: () => void;
}

export default function TemplateCard({ templateId, templateName, staticTemplateJson, onDelete }: TemplateCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const divkitRef = useRef<any>(null);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`http://localhost:3001/templates/${templateId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete template');
      }

      // Call onDelete callback if provided
      if (onDelete) {
        onDelete();
      }
      
      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error deleting template:', error);
      alert('Failed to delete template. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  useEffect(() => {
    if (!containerRef.current || !staticTemplateJson) return;

    const initDivKit = async () => {
      try {
        const divkitModule = await import('@divkitframework/divkit/client');
        const container = containerRef.current;
        if (!container) return;

        container.innerHTML = '';

        const instanceId = `divkit-card-${templateId}-${Math.random().toString(36).substr(2, 9)}`;
        const targetDiv = document.createElement('div');
        targetDiv.id = instanceId;
        container.appendChild(targetDiv);

        divkitModule.render({
          target: targetDiv,
          id: instanceId,
          json: staticTemplateJson,
        });

        divkitRef.current = {
          destroy: () => {
            if (containerRef.current) {
              containerRef.current.innerHTML = '';
            }
          }
        };
      } catch (error) {
        console.error('Error rendering DivKit card:', error);
      }
    };

    initDivKit();

    return () => {
      if (divkitRef.current && typeof divkitRef.current.destroy === 'function') {
        divkitRef.current.destroy();
      }
    };
  }, [staticTemplateJson, templateId]);

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden h-full flex flex-col">
      {/* DivKit Preview */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100" style={{ height: '200px' }}>
        <div 
          ref={containerRef}
          className="w-full h-full p-3 overflow-hidden"
          style={{ 
            transform: 'scale(0.8)',
            transformOrigin: 'top center'
          }}
        />
        {/* Overlay gradient for fade effect */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
      </div>
      
      {/* Content Section */}
      <div className="p-5 bg-white flex flex-col gap-4 flex-1">
        {/* Template Name */}
        <h3 className="text-base font-semibold text-gray-800 truncate">
          {templateName}
        </h3>
        
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link
            href={`/mapper/${templateId}`}
            className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl border-2 transition-all hover:bg-orange-50"
            style={{ borderColor: '#e75e27', color: '#e75e27' }}
          >
            View Template
          </Link>
          
          <button
            onClick={() => setShowConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-3 text-sm font-semibold rounded-xl border-2 border-red-200 text-red-600 transition-all hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete template"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Template</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 mb-6">
              Are you sure you want to delete <span className="font-semibold">{templateName}</span>? All data associated with this template will be permanently removed.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

