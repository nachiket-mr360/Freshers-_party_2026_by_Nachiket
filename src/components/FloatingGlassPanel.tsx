import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Extra class for per-panel sizing. */
  className?: string;
  /** Accessible role for dialog-like panels. */
  role?: 'group' | 'region';
  'aria-label'?: string;
}

/**
 * Frosted-glass container (spec §9 — F1 Floating Glass Interface).
 * Presentation only; children remain real, accessible HTML controls.
 */
export function FloatingGlassPanel({ children, className = '', ...rest }: Props) {
  return (
    <div className={`glass-panel ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}
