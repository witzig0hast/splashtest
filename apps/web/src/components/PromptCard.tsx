import type { CSSProperties, ReactNode } from 'react';

export default function PromptCard({
  icon,
  iconTint,
  eyebrow,
  title,
  children,
}: {
  icon?: string;
  iconTint?: string;
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="prompt-stack">
      <div className="prompt-ghost prompt-ghost-2" />
      <div className="prompt-ghost prompt-ghost-1" />
      <div className="prompt-card">
        {icon && (
          <span className="prompt-icon" style={{ '--icon-tint': iconTint } as CSSProperties}>
            {icon}
          </span>
        )}
        {eyebrow && <span className="prompt-eyebrow">{eyebrow}</span>}
        <h2 className="prompt-title">{title}</h2>
        <span className="prompt-divider">⚬ ⚬ ⚬</span>
        {children && <div className="prompt-body">{children}</div>}
      </div>
    </div>
  );
}
