import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  emoji?: string;
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
  emoji = '📭',
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {emoji && (
        <div className="text-6xl mb-4">{emoji}</div>
      )}
      {icon && (
        <div className="mb-4 text-gray-400">{icon}</div>
      )}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && (
        <p className="text-gray-600 max-w-md mb-4">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
