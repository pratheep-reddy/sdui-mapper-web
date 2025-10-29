'use client';

import { useEffect, useRef } from 'react';
import '@divkitframework/divkit/dist/client.css';

interface DivKitRendererProps {
  data: any;
}

export default function DivKitRenderer({ data }: DivKitRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const divkitRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !data) return;

    const initDivKit = async () => {
      try {
        // Import DivKit client dynamically
        const divkitModule = await import('@divkitframework/divkit/client');
        
        const container = containerRef.current;
        if (!container) return;

        // Clear previous content
        container.innerHTML = '';

        // Create a unique ID for this instance
        const instanceId = `divkit-${Math.random().toString(36).substr(2, 9)}`;
        const targetDiv = document.createElement('div');
        targetDiv.id = instanceId;
        container.appendChild(targetDiv);

        // Render using DivKit
        divkitModule.render({
          target: targetDiv,
          id: instanceId,
          json: data,
        });

        divkitRef.current = { destroy: () => {
          if (containerRef.current) {
            containerRef.current.innerHTML = '';
          }
        }};
      } catch (error) {
        console.error('Error initializing DivKit:', error);
        const container = containerRef.current;
        if (container) {
          container.innerHTML = `
            <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p class="text-red-700">Error rendering preview: ${error instanceof Error ? error.message : 'Unknown error'}</p>
            </div>
          `;
        }
      }
    };

    initDivKit();

    // Cleanup
    return () => {
      if (divkitRef.current && typeof divkitRef.current.destroy === 'function') {
        divkitRef.current.destroy();
      }
    };
  }, [data]);

  return (
    <div 
      ref={containerRef} 
      className="w-full min-h-[400px] bg-white rounded-lg p-4 text-slate-900"
    />
  );
}

