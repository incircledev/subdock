import type { ComponentProps } from 'react';
import { X } from 'lucide-react';
import { DialogContent, DialogClose } from '@/components/ui/dialog';
import { useI18n } from '@/components/i18n-provider';
export function LocalizedDialogContent({
  children,
  ...props
}: ComponentProps<typeof DialogContent>) {
  const { t } = useI18n();
  return (
    <DialogContent {...props} showCloseButton={false}>
      {children}
      <DialogClose className="localized-dialog-close" aria-label={t('关闭')}>
        <X size={18} />
      </DialogClose>
    </DialogContent>
  );
}
