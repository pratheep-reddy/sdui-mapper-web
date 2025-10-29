import React from 'react';

export type TextVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'body' 
  | 'bodyLarge' 
  | 'bodySmall' 
  | 'caption' 
  | 'overline'
  | 'mono';

export type TextWeight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  align?: 'left' | 'center' | 'right' | 'justify';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  children: React.ReactNode;
}

const variantClasses: Record<TextVariant, string> = {
  h1: 'text-5xl md:text-6xl font-bold leading-tight',
  h2: 'text-4xl md:text-5xl font-bold leading-tight',
  h3: 'text-3xl md:text-4xl font-semibold leading-snug',
  h4: 'text-2xl md:text-3xl font-semibold leading-snug',
  body: 'text-base leading-relaxed',
  bodyLarge: 'text-lg leading-relaxed',
  bodySmall: 'text-sm leading-normal',
  caption: 'text-xs leading-normal',
  overline: 'text-xs uppercase tracking-wider font-medium',
  mono: 'font-mono text-sm leading-normal',
};

const weightClasses: Record<TextWeight, string> = {
  light: 'font-light',
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
  justify: 'text-justify',
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  weight,
  color,
  align = 'left',
  as,
  className = '',
  children,
  style,
  ...props
}) => {
  // Determine the HTML element to use
  const Component = as || (variant.startsWith('h') ? variant as 'h1' | 'h2' | 'h3' | 'h4' : 'p');
  
  // Build class names
  const classes = [
    variantClasses[variant],
    weight && weightClasses[weight],
    alignClasses[align],
    variant === 'mono' ? 'font-mono' : 'font-sans',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Merge styles
  const mergedStyle = {
    ...style,
    ...(color && { color }),
  };

  return (
    <Component className={classes} style={mergedStyle} {...props}>
      {children}
    </Component>
  );
};

// Convenience components for common use cases
export const Heading1: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="h4" {...props} />
);

export const BodyText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="body" {...props} />
);

export const BodyLargeText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="bodyLarge" {...props} />
);

export const BodySmallText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="bodySmall" {...props} />
);

export const Caption: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="caption" {...props} />
);

export const Overline: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="overline" {...props} />
);

export const MonoText: React.FC<Omit<TextProps, 'variant'>> = (props) => (
  <Text variant="mono" {...props} />
);

