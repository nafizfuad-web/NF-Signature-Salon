import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import type { ButtonSize, ButtonVariant } from '@/components/common/Button'

interface ButtonLinkProps {
  to: string
  children: ReactNode
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  'aria-label'?: string
  onClick?: () => void
}

export default function ButtonLink({
  to,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  leftIcon,
  rightIcon,
  onClick,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        fullWidth && 'btn-block',
        className
      )}
      {...props}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </Link>
  )
}
