import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4 text-center">
      {icon && (
        <div className="tg-hint">
          {icon}
        </div>
      )}
      <div>
        <h3 className="text-lg font-medium tg-text">{title}</h3>
        {description && (
          <p className="mt-1 tg-hint text-sm">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
