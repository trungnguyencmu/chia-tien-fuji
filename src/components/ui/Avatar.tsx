import { useMemo } from 'react';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Every swatch keeps white initials at 4.5:1 or better
const COLORS = [
  '#b91c1c', '#c2410c', '#a16207', '#4d7c0f',
  '#047857', '#0f766e', '#0e7490', '#1d4ed8',
  '#4338ca', '#7e22ce', '#a21caf', '#be185d',
];

function getColor(name: string): string {
  const safe = name ?? '';
  let hash = 0;
  for (let i = 0; i < safe.length; i++) {
    hash = safe.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

function getInitials(name: string): string {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return '?';
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const initials = useMemo(() => getInitials(name), [name]);
  const bgColor = useMemo(() => getColor(name), [name]);

  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : '';

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: bgColor }}
      title={name}
    >
      {initials}
    </div>
  );
}

interface AvatarGroupProps {
  names: string[];
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AvatarGroup({ names, max = 4, size = 'sm' }: AvatarGroupProps) {
  const visible = names.slice(0, max);
  const remaining = names.length - max;

  return (
    <div className="avatar-group">
      {visible.map((name, i) => (
        <Avatar key={i} name={name} size={size} />
      ))}
      {remaining > 0 && (
        <div className={`avatar avatar-${size} avatar-neutral`}>
          +{remaining}
        </div>
      )}
    </div>
  );
}
