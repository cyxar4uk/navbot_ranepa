import { X } from 'lucide-react'

interface FiltersProps {
  types: string[]
  selectedType: string | null
  onTypeChange: (type: string | null) => void
  onReset: () => void
}

export default function Filters({
  types,
  selectedType,
  onTypeChange,
  onReset,
}: FiltersProps) {
  const hasFilters = selectedType !== null

  return (
    <div className="mt-3 p-4 rounded-xl tg-secondary animate-fadeIn">
      {/* Type filter */}
      {types.length > 0 && (
        <div className="mb-4">
          <div className="text-sm font-medium tg-text mb-2">Тип</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTypeChange(null)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedType === null
                  ? 'bg-primary-500 text-white'
                  : 'bg-white tg-text'
              }`}
            >
              Все
            </button>
            {types.map(type => (
              <button
                key={type}
                onClick={() => onTypeChange(type)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  selectedType === type
                    ? 'bg-primary-500 text-white'
                    : 'bg-white tg-text'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      {hasFilters && (
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-sm tg-hint hover:tg-text transition-colors"
        >
          <X className="w-4 h-4" />
          Сбросить фильтры
        </button>
      )}
    </div>
  )
}
