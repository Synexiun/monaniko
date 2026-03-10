'use client';

import { useState, useRef, useCallback, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/* -------------------------------------------------------------------------- */
/*  Shared wrapper                                                            */
/* -------------------------------------------------------------------------- */

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

function FieldWrapper({
  label,
  error,
  required,
  helpText,
  children,
  htmlFor,
}: FormFieldProps & { children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {helpText && !error && (
        <p className="text-xs text-gray-400">{helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  FormInput                                                                 */
/* -------------------------------------------------------------------------- */

interface FormInputProps
  extends FormFieldProps,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> {
  icon?: React.ReactNode;
}

export function FormInput({
  label,
  error,
  required,
  helpText,
  icon,
  id,
  ...inputProps
}: FormInputProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <FieldWrapper
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      htmlFor={fieldId}
    >
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          id={fieldId}
          className={cn(
            'w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300',
            error
              ? 'border-red-300 focus:ring-red-500/10 focus:border-red-400'
              : 'border-gray-200',
            icon && 'pl-10'
          )}
          {...inputProps}
        />
      </div>
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*  FormTextArea                                                              */
/* -------------------------------------------------------------------------- */

interface FormTextAreaProps
  extends FormFieldProps,
    Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'> {}

export function FormTextArea({
  label,
  error,
  required,
  helpText,
  id,
  ...textareaProps
}: FormTextAreaProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <FieldWrapper
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      htmlFor={fieldId}
    >
      <textarea
        id={fieldId}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors resize-y min-h-[100px]',
          'focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300',
          error
            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-400'
            : 'border-gray-200'
        )}
        {...textareaProps}
      />
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*  FormSelect                                                                */
/* -------------------------------------------------------------------------- */

interface FormSelectProps
  extends FormFieldProps,
    Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function FormSelect({
  label,
  error,
  required,
  helpText,
  options,
  placeholder,
  id,
  ...selectProps
}: FormSelectProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <FieldWrapper
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      htmlFor={fieldId}
    >
      <select
        id={fieldId}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 bg-white transition-colors appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300',
          'bg-[url("data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%239CA3AF%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E")] bg-[length:20px] bg-[right_12px_center] bg-no-repeat pr-10',
          error
            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-400'
            : 'border-gray-200'
        )}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*  FormToggle                                                                */
/* -------------------------------------------------------------------------- */

interface FormToggleProps extends FormFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function FormToggle({
  label,
  error,
  required,
  helpText,
  checked,
  onChange,
  disabled = false,
}: FormToggleProps) {
  return (
    <FieldWrapper label={label} error={error} required={required} helpText={helpText}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:ring-offset-2',
          checked ? 'bg-gray-900' : 'bg-gray-200',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 rounded-full bg-white transition-transform shadow-sm',
            checked ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*  FormDatePicker                                                            */
/* -------------------------------------------------------------------------- */

interface FormDatePickerProps extends FormFieldProps {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
}

export function FormDatePicker({
  label,
  error,
  required,
  helpText,
  value,
  onChange,
  min,
  max,
  disabled = false,
}: FormDatePickerProps) {
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <FieldWrapper
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      htmlFor={fieldId}
    >
      <input
        id={fieldId}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          'w-full rounded-lg border px-4 py-2.5 text-sm text-gray-900 transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-gray-900/10 focus:border-gray-300',
          error
            ? 'border-red-300 focus:ring-red-500/10 focus:border-red-400'
            : 'border-gray-200',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50'
        )}
      />
    </FieldWrapper>
  );
}

/* -------------------------------------------------------------------------- */
/*  FormTagInput                                                              */
/* -------------------------------------------------------------------------- */

interface FormTagInputProps extends FormFieldProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
}

export function FormTagInput({
  label,
  error,
  required,
  helpText,
  value,
  onChange,
  placeholder = 'Type and press Enter...',
  maxTags,
}: FormTagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim().toLowerCase();
      if (!trimmed) return;
      if (value.includes(trimmed)) return;
      if (maxTags && value.length >= maxTags) return;
      onChange([...value, trimmed]);
      setInputValue('');
    },
    [value, onChange, maxTags]
  );

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChange(value.filter((t) => t !== tagToRemove));
    },
    [value, onChange]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    } else if (
      e.key === 'Backspace' &&
      inputValue === '' &&
      value.length > 0
    ) {
      removeTag(value[value.length - 1]);
    }
  };

  return (
    <FieldWrapper
      label={label}
      error={error}
      required={required}
      helpText={helpText}
      htmlFor={fieldId}
    >
      <div
        className={cn(
          'flex flex-wrap items-center gap-1.5 rounded-lg border px-3 py-2 min-h-[42px] cursor-text transition-colors',
          'focus-within:ring-2 focus-within:ring-gray-900/10 focus-within:border-gray-300',
          error
            ? 'border-red-300 focus-within:ring-red-500/10 focus-within:border-red-400'
            : 'border-gray-200'
        )}
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 text-xs font-medium text-gray-700"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={fieldId}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue);
          }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] text-sm text-gray-900 placeholder:text-gray-400 outline-none bg-transparent py-0.5"
          disabled={maxTags ? value.length >= maxTags : false}
        />
      </div>
    </FieldWrapper>
  );
}
