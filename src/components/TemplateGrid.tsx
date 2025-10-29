'use client';

import TemplateCard from './TemplateCard';

interface Template {
  templateId: string;
  templateName: string;
  templateType: string;
  staticTemplateJson: any;
  dynamicTemplateJson: any;
}

interface TemplateGridProps {
  templates: Template[];
}

export default function TemplateGrid({ templates }: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.templateId}
          templateId={template.templateId}
          templateName={template.templateName}
          staticTemplateJson={template.staticTemplateJson}
        />
      ))}
    </div>
  );
}

