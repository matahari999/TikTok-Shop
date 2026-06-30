import { cn } from '@/shared/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
  suffix?: string
}

export default function Input({ label, error, icon, suffix, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-gray-600">{label}</label>}
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input
          className={cn(
            'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none transition-colors',
            'focus:border-[#EE1D52] focus:ring-1 focus:ring-[#EE1D52]/20',
            icon && 'pl-9',
            suffix && 'pr-12',
            error && 'border-red-400',
            className,
          )}
          {...props}
        />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
