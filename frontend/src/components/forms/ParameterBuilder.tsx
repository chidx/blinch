/**
 * Parameter builder component for adding custom action parameters
 */

'use client';

import { useState } from 'react';

export interface ActionParameter {
  name: string;
  label: string;
  type: 'text' | 'number' | 'boolean' | 'date';
  required: boolean;
  default?: string | number | boolean;
}

interface ParameterBuilderProps {
  value: ActionParameter[];
  onChange: (parameters: ActionParameter[]) => void;
  maxParameters?: number;
}

const PARAMETER_TYPES: { label: string; value: ActionParameter['type'] }[] = [
  { label: 'Text', value: 'text' },
  { label: 'Number', value: 'number' },
  { label: 'Boolean', value: 'boolean' },
  { label: 'Date', value: 'date' },
];

export function ParameterBuilder({ value = [], onChange, maxParameters = 5 }: ParameterBuilderProps) {
  const [newParam, setNewParam] = useState<Partial<ActionParameter>>({
    name: '',
    label: '',
    type: 'text',
    required: false,
  });

  const canAdd = value.length < maxParameters;
  const isValidParam = newParam.name && newParam.label && newParam.type;

  const handleAdd = () => {
    if (!canAdd || !isValidParam) return;

    const param: ActionParameter = {
      name: newParam.name!,
      label: newParam.label!,
      type: newParam.type!,
      required: newParam.required || false,
    };

    onChange([...value, param]);
    setNewParam({ name: '', label: '', type: 'text', required: false });
  };

  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newParams = [...value];
    [newParams[index - 1], newParams[index]] = [newParams[index], newParams[index - 1]];
    onChange(newParams);
  };

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return;
    const newParams = [...value];
    [newParams[index], newParams[index + 1]] = [newParams[index + 1], newParams[index]];
    onChange(newParams);
  };

  return (
    <div className="space-y-4">
      {/* Existing Parameters */}
      {value.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Custom Parameters ({value.length}/{maxParameters})
          </label>

          {value.map((param, index) => (
            <div
              key={index}
              className="glass rounded-lg p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{param.label}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-400">
                    {param.type}
                  </span>
                  {param.required && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                      required
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 font-mono">{param.name}</p>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move up"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === value.length - 1}
                  className="p-1.5 rounded hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Move down"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="p-1.5 rounded hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                  title="Remove"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Parameter Form */}
      {canAdd ? (
        <div className="glass-strong rounded-lg p-4 space-y-3">
          <label className="block text-sm font-medium text-gray-300">
            Add Custom Parameter
          </label>

          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Field Name (code)</label>
              <input
                type="text"
                placeholder="e.g., user_note"
                value={newParam.name || ''}
                onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
                className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-primary focus:outline-none text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Display Label</label>
              <input
                type="text"
                placeholder="e.g., Your Note"
                value={newParam.label || ''}
                onChange={(e) => setNewParam({ ...newParam, label: e.target.value })}
                className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-primary focus:outline-none text-sm"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Type</label>
              <select
                value={newParam.type}
                onChange={(e) => setNewParam({ ...newParam, type: e.target.value as ActionParameter['type'] })}
                className="w-full px-3 py-2 rounded bg-white/5 border border-white/10 focus:border-primary focus:outline-none text-sm"
              >
                {PARAMETER_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newParam.required || false}
                  onChange={(e) => setNewParam({ ...newParam, required: e.target.checked })}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-primary focus:ring-primary focus:ring-offset-0"
                />
                <span className="text-sm text-gray-400">Required</span>
              </label>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={!isValidParam}
            className="w-full px-4 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add Parameter
          </button>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Maximum {maxParameters} parameters reached
        </p>
      )}

      {value.length === 0 && (
        <p className="text-xs text-gray-500">
          Custom parameters allow users to input additional data when executing your action.
          Leave empty if not needed.
        </p>
      )}
    </div>
  );
}
