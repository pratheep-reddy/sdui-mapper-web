'use client';

import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  BodyText,
  BodyLargeText,
  BodySmallText,
  Caption,
  Overline,
  MonoText,
  Text,
} from '@/components';

export default function TextExamplesPage() {
  return (
    <div className="min-h-screen p-8 bg-background">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div>
          <Heading1>Text Component Examples</Heading1>
          <Caption className="mt-2 text-gray-600">
            Using Geist Sans and Geist Mono fonts
          </Caption>
        </div>

        {/* Headings Section */}
        <section className="space-y-4">
          <Overline color="#6366f1">Headings</Overline>
          <div className="space-y-4">
            <Heading1>Heading 1 - Main Title</Heading1>
            <Heading2>Heading 2 - Section Title</Heading2>
            <Heading3>Heading 3 - Subsection Title</Heading3>
            <Heading4>Heading 4 - Minor Heading</Heading4>
          </div>
        </section>

        {/* Body Text Section */}
        <section className="space-y-4">
          <Overline color="#6366f1">Body Text</Overline>
          <div className="space-y-4">
            <BodyLargeText>
              Large body text for emphasis. This is typically used for introductory paragraphs 
              or important content that needs to stand out.
            </BodyLargeText>
            <BodyText>
              Regular body text for standard content. Lorem ipsum dolor sit amet, consectetur 
              adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </BodyText>
            <BodySmallText>
              Small body text for secondary information or fine print.
            </BodySmallText>
          </div>
        </section>

        {/* Font Weights */}
        <section className="space-y-4">
          <Overline color="#6366f1">Font Weights</Overline>
          <div className="space-y-2">
            <BodyText weight="light">Light weight text</BodyText>
            <BodyText weight="regular">Regular weight text</BodyText>
            <BodyText weight="medium">Medium weight text</BodyText>
            <BodyText weight="semibold">Semibold weight text</BodyText>
            <BodyText weight="bold">Bold weight text</BodyText>
          </div>
        </section>

        {/* Text Alignment */}
        <section className="space-y-4">
          <Overline color="#6366f1">Text Alignment</Overline>
          <div className="space-y-2">
            <BodyText align="left">Left aligned text (default)</BodyText>
            <BodyText align="center">Center aligned text</BodyText>
            <BodyText align="right">Right aligned text</BodyText>
            <BodyText align="justify">
              Justified text. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
            </BodyText>
          </div>
        </section>

        {/* Colors */}
        <section className="space-y-4">
          <Overline color="#6366f1">Custom Colors</Overline>
          <div className="space-y-2">
            <BodyText color="#ef4444">Red text</BodyText>
            <BodyText color="#10b981">Green text</BodyText>
            <BodyText color="#3b82f6">Blue text</BodyText>
            <BodyText color="#8b5cf6">Purple text</BodyText>
          </div>
        </section>

        {/* Mono Font */}
        <section className="space-y-4">
          <Overline color="#6366f1">Monospace Font</Overline>
          <div className="space-y-2 bg-gray-900 p-4 rounded-lg">
            <MonoText color="#22c55e">
              const greeting = "Hello, World!";
            </MonoText>
            <MonoText color="#60a5fa">
              function example() {'{'}
            </MonoText>
            <MonoText color="#e5e7eb">
              &nbsp;&nbsp;console.log(greeting);
            </MonoText>
            <MonoText color="#60a5fa">
              {'}'}
            </MonoText>
          </div>
        </section>

        {/* Caption and Overline */}
        <section className="space-y-4">
          <Overline color="#6366f1">Small Text Variants</Overline>
          <div className="space-y-2">
            <Caption>Caption text for image descriptions or footnotes</Caption>
            <Overline>Overline text for section labels</Overline>
          </div>
        </section>

        {/* Custom Element */}
        <section className="space-y-4">
          <Overline color="#6366f1">Custom HTML Elements</Overline>
          <div className="space-y-2">
            <Text variant="body" as="span" className="inline-block mr-2">
              Inline span element
            </Text>
            <Text variant="body" as="div" className="p-4 bg-gray-100 rounded">
              Div element with padding and background
            </Text>
          </div>
        </section>

        {/* Practical Example */}
        <section className="space-y-4">
          <Overline color="#6366f1">Practical Card Example</Overline>
          <div className="border border-gray-200 rounded-lg p-6 space-y-4">
            <Heading3>Product Card</Heading3>
            <Caption className="text-gray-500">SKU: ABC-12345</Caption>
            <BodyText>
              High-quality product with excellent features and outstanding performance.
              Perfect for everyday use.
            </BodyText>
            <div className="flex items-baseline gap-2">
              <Heading4 color="#10b981">$99.99</Heading4>
              <BodySmallText className="line-through text-gray-400">$129.99</BodySmallText>
            </div>
            <Caption className="text-gray-600">Free shipping on orders over $50</Caption>
          </div>
        </section>
      </div>
    </div>
  );
}

