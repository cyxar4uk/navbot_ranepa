interface LoadingProps {
  text?: string
  fullScreen?: boolean
}

export default function Loading({ text = 'Загрузка...', fullScreen = false }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-4 border-primary-200 rounded-full" />
        <div className="absolute inset-0 border-4 border-primary-500 rounded-full border-t-transparent animate-spin" />
      </div>
      <p className="tg-hint text-sm">{text}</p>
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center tg-bg z-50">
        {content}
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  )
}
