import { useState, useEffect } from 'react'
import Input from './Input'

interface DateInputProps {
  label?: string
  error?: string
  icon?: React.ReactNode
  suffix?: string
  value?: string  // YYYY-MM-DD
  onChange?: (e: { target: { value: string } }) => void
  className?: string
}

function isoToDisplay(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return ''
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}`
}

function displayToIso(display: string): string {
  const m = display.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : ''
}

export default function DateInput({ value = '', onChange, ...props }: DateInputProps) {
  const [display, setDisplay] = useState(() => isoToDisplay(value))

  useEffect(() => {
    setDisplay(isoToDisplay(value))
  }, [value])

  return (
    <Input
      {...props}
      type="text"
      value={display}
      placeholder="dd/mm/yyyy"
      maxLength={10}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value
        setDisplay(v)
        const iso = displayToIso(v)
        if (iso) onChange?.({ target: { value: iso } })
        else if (v === '') onChange?.({ target: { value: '' } })
      }}
    />
  )
}
