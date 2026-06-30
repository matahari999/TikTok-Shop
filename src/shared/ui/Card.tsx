import { cn } from '@/shared/lib/utils'

interface CardProps { className?: string; children: React.ReactNode; onClick?: () => void }

export default function Card({ className, children, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn('bg-white rounded-2xl border border-gray-100 shadow-sm p-4', onClick && 'cursor-pointer hover:shadow-md transition-shadow', className)}
    >
      {children}
    </div>
  )
}
