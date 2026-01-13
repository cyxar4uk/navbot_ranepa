import { ModuleField } from '../../types';
import { Crown } from 'lucide-react';

interface ModuleFieldRendererProps {
  field: ModuleField;
  value: any;
  onChange: (value: any) => void;
  allValues?: Record<string, any>;
}

export function ModuleFieldRenderer({ field, value, onChange, allValues = {} }: ModuleFieldRendererProps) {
  // Check if field should be shown based on conditional logic
  if (field.conditional) {
    const conditionValue = allValues[field.conditional.field];
    if (conditionValue !== field.conditional.value) {
      return null;
    }
  }

  const renderField = () => {
    switch (field.type) {
      case 'toggle':
        return (
          <label className="flex items-center justify-between p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-all cursor-pointer group">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{field.label}</span>
                {field.isPremium && (
                  <Crown className="w-3.5 h-3.5 text-amber-500" />
                )}
              </div>
              {field.description && (
                <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
              )}
            </div>
            <div className="relative ml-4">
              <input
                type="checkbox"
                checked={value ?? field.defaultValue ?? false}
                onChange={(e) => onChange(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted rounded-full peer peer-checked:bg-gradient-to-r peer-checked:from-primary peer-checked:to-accent transition-all"></div>
              <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-sm"></div>
            </div>
          </label>
        );

      case 'text':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-primary">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <input
              type="text"
              value={value ?? field.defaultValue ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
            />
          </div>
        );

      case 'textarea':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-primary">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <textarea
              value={value ?? field.defaultValue ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={field.placeholder}
              rows={4}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>
        );

      case 'number':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-primary">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <input
              type="number"
              value={value ?? field.defaultValue ?? ''}
              onChange={(e) => onChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
            />
          </div>
        );

      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-primary">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <select
              value={value ?? field.defaultValue ?? ''}
              onChange={(e) => onChange(e.target.value)}
              className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none cursor-pointer"
            >
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'radio':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-primary">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <div className="space-y-2">
              {field.options?.map((option) => (
                <label
                  key={option.value}
                  className="flex items-center p-3 bg-card rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all group"
                >
                  <input
                    type="radio"
                    name={field.id}
                    value={option.value}
                    checked={(value ?? field.defaultValue) === option.value}
                    onChange={() => onChange(option.value)}
                    className="w-4 h-4 text-primary border-border focus:ring-primary"
                  />
                  <span className="ml-3 text-sm text-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'slider':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2 justify-between">
              <span>
                {field.label}
                {field.required && <span className="text-primary ml-1">*</span>}
              </span>
              <span className="text-sm font-bold text-primary">
                {value ?? field.defaultValue ?? field.min}
              </span>
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <input
              type="range"
              value={value ?? field.defaultValue ?? field.min}
              onChange={(e) => onChange(Number(e.target.value))}
              min={field.min}
              max={field.max}
              step={field.step}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>{field.min}</span>
              <span>{field.max}</span>
            </div>
          </div>
        );

      case 'color':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-primary">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={value ?? field.defaultValue ?? '#D32F2F'}
                onChange={(e) => onChange(e.target.value)}
                className="w-16 h-16 rounded-lg border-2 border-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={value ?? field.defaultValue ?? '#D32F2F'}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#RRGGBB"
                className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground font-mono"
              />
            </div>
          </div>
        );

      case 'multiselect':
        return (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              {field.label}
              {field.required && <span className="text-primary">*</span>}
            </label>
            {field.description && (
              <p className="text-xs text-muted-foreground mb-2">{field.description}</p>
            )}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {field.options?.map((option) => {
                const selected = Array.isArray(value) ? value : [];
                const isChecked = selected.includes(option.value);
                
                return (
                  <label
                    key={option.value}
                    className="flex items-center p-3 bg-card rounded-lg border border-border hover:border-primary/30 cursor-pointer transition-all"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onChange([...selected, option.value]);
                        } else {
                          onChange(selected.filter((v: string) => v !== option.value));
                        }
                      }}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="ml-3 text-sm text-foreground">{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              Тип поля "{field.type}" не поддерживается
            </p>
          </div>
        );
    }
  };

  return <div className="module-field">{renderField()}</div>;
}
