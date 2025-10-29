# Text Components Documentation

## Overview

Reusable text components built with TypeScript and Tailwind CSS, utilizing the Geist Sans and Geist Mono fonts.

## Components

### Base Text Component

```tsx
import { Text } from '@/components';

<Text 
  variant="body"          // Typography variant
  weight="regular"        // Font weight
  color="#ff0000"        // Custom color
  align="left"           // Text alignment
  as="p"                 // HTML element
>
  Your text here
</Text>
```

### Convenience Components

#### Headings

```tsx
import { Heading1, Heading2, Heading3, Heading4 } from '@/components';

<Heading1>Main Title</Heading1>
<Heading2>Section Title</Heading2>
<Heading3>Subsection Title</Heading3>
<Heading4>Minor Heading</Heading4>
```

#### Body Text

```tsx
import { BodyText, BodyLargeText, BodySmallText } from '@/components';

<BodyLargeText>Important paragraph</BodyLargeText>
<BodyText>Standard paragraph</BodyText>
<BodySmallText>Secondary information</BodySmallText>
```

#### Special Text

```tsx
import { Caption, Overline, MonoText } from '@/components';

<Caption>Image caption or footnote</Caption>
<Overline>Section Label</Overline>
<MonoText>const code = "example";</MonoText>
```

## Props

### TextProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `TextVariant` | `'body'` | Typography style |
| `weight` | `TextWeight` | - | Font weight override |
| `color` | `string` | - | Custom text color (hex, rgb, etc.) |
| `align` | `'left' \| 'center' \| 'right' \| 'justify'` | `'left'` | Text alignment |
| `as` | `HTML Element` | Varies | HTML element to render as |
| `className` | `string` | - | Additional Tailwind classes |
| `style` | `CSSProperties` | - | Inline styles |

### TextVariant Options

- `h1` - Largest heading (5xl/6xl)
- `h2` - Large heading (4xl/5xl)
- `h3` - Medium heading (3xl/4xl)
- `h4` - Small heading (2xl/3xl)
- `body` - Standard body text (base)
- `bodyLarge` - Large body text (lg)
- `bodySmall` - Small body text (sm)
- `caption` - Caption text (xs)
- `overline` - Label text (xs, uppercase, tracking)
- `mono` - Monospace text (Geist Mono font)

### TextWeight Options

- `light` - Font weight 300
- `regular` - Font weight 400 (default)
- `medium` - Font weight 500
- `semibold` - Font weight 600
- `bold` - Font weight 700

## Usage Examples

### Basic Usage

```tsx
import { BodyText } from '@/components';

<BodyText>
  This is a paragraph with standard styling.
</BodyText>
```

### With Custom Weight

```tsx
<BodyText weight="bold">
  This text is bold.
</BodyText>
```

### With Custom Color

```tsx
<Heading2 color="#6366f1">
  Colored Heading
</Heading2>
```

### With Alignment

```tsx
<BodyText align="center">
  Centered text
</BodyText>
```

### With Custom Element

```tsx
<Text variant="body" as="span" className="inline-block">
  Inline text
</Text>
```

### Combining Props

```tsx
<BodyLargeText 
  weight="semibold" 
  color="#10b981" 
  align="center"
  className="mb-4"
>
  Featured Content
</BodyLargeText>
```

### Code Block Example

```tsx
<div className="bg-gray-900 p-4 rounded-lg">
  <MonoText color="#22c55e">
    const greeting = "Hello, World!";
  </MonoText>
</div>
```

### Card Example

```tsx
<div className="border rounded-lg p-6">
  <Heading3>Product Name</Heading3>
  <Caption className="text-gray-500">SKU: ABC-123</Caption>
  <BodyText className="mt-4">
    Product description goes here.
  </BodyText>
  <Heading4 color="#10b981" className="mt-4">
    $99.99
  </Heading4>
</div>
```

## Styling

### Tailwind Classes

All components accept `className` prop for additional Tailwind classes:

```tsx
<BodyText className="mb-4 text-gray-600 hover:text-gray-900">
  Text with custom classes
</BodyText>
```

### Inline Styles

Use the `style` prop for inline styles:

```tsx
<Heading1 style={{ marginBottom: '2rem', lineHeight: '1.2' }}>
  Custom Styled Heading
</Heading1>
```

### Color Prop

The `color` prop supports any valid CSS color:

```tsx
<BodyText color="#ff0000">Red</BodyText>
<BodyText color="rgb(255, 0, 0)">Red RGB</BodyText>
<BodyText color="hsl(0, 100%, 50%)">Red HSL</BodyText>
```

## Responsive Design

Text components use responsive font sizes:

```tsx
// h1: text-5xl on mobile, text-6xl on md+ screens
<Heading1>Responsive Heading</Heading1>

// h2: text-4xl on mobile, text-5xl on md+ screens
<Heading2>Responsive Heading</Heading2>
```

## Accessibility

- Semantic HTML elements by default
- Override with `as` prop when needed
- Proper heading hierarchy (h1 → h2 → h3 → h4)

## View Examples

Visit `/text-examples` to see all text components in action.

## Integration with Geist Fonts

The components automatically use:
- **Geist Sans** for standard text (h1-h4, body, caption, overline)
- **Geist Mono** for code/mono variant

Configured in `layout.tsx`:
```tsx
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
```

