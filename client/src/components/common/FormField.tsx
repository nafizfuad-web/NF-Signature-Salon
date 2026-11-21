import { useId, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import Icon, { type IconName } from '@/components/common/Icon'
import { cn } from '@/lib/cn'

interface FormFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id?: string
  label: string
  error?: string
  hint?: string
  icon?: IconName
}

export default function FormField({
  id,
  label,
  error,
  hint,
  icon,
  type = 'text',
  className,
  required,
  ...props
}: FormFieldProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const resolvedType = isPassword && showPassword ? 'text' : type
  const descriptionId = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined

  return (
    <div className={cn('form-group', error && 'form-group-error', className)}>
      <label className="form-label" htmlFor={fieldId}>
        {label}
        {required && <span className="form-required" aria-hidden="true"> *</span>}
      </label>

      <div className="input-wrap">
        {icon && (
          <span className="input-icon" aria-hidden="true">
            <Icon name={icon} size={17} />
          </span>
        )}
        <input
          {...props}
          id={fieldId}
          type={resolvedType}
          className={cn('form-input', icon && 'has-icon', isPassword && 'has-action')}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={descriptionId}
        />
        {isPassword && (
          <button
            type="button"
            className="input-action"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
          >
            <Icon name={showPassword ? 'eye-off' : 'eye'} size={17} />
          </button>
        )}
      </div>

      {error ? (
        <p className="form-error" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      ) : (
        hint && (
          <p className="form-hint" id={`${fieldId}-hint`}>
            {hint}
          </p>
        )
      )}
    </div>
  )
}
