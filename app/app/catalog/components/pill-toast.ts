import { toast } from 'sonner'

/**
 * Custom helper to trigger center-bottom compact pill notifications (toasts)
 * in compliance with the stakeholder requirements for the Catalog module.
 */
export function showPillToast(message: string, type: 'success' | 'error' = 'success') {
  const isError = type === 'error'

  toast(message, {
    position: 'bottom-center',
    duration: 2000,
    className: '!rounded-full !px-5 !py-2.5 !w-auto !min-w-[200px] !max-w-xs !mx-auto !shadow-lg !border !flex !items-center !justify-center !text-ds-body-sm !font-semibold !transition-all !duration-ds-normal',
    style: {
      backgroundColor: 'var(--card)',
      borderColor: isError ? 'var(--destructive)' : 'var(--success)',
      color: isError ? 'var(--destructive)' : 'var(--success)',
    },
  })
}
