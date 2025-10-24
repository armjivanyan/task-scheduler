import { useMessage, useDialog } from 'naive-ui';

export function useNotify() {
  const message = useMessage();
  const dialog = useDialog();

  return {
    success: (t: string) => message.success(t),
    error: (t: string) => message.error(t),
    info: (t: string) => message.info(t),
    warning: (t: string) => message.warning(t),
    confirm: (opts: { title?: string; content?: string; positiveText?: string; negativeText?: string; onPositiveClick?: () => void; onNegativeClick?: () => void; }) =>
      dialog.warning({
        title: opts.title ?? 'Are you sure?',
        content: opts.content ?? '',
        positiveText: opts.positiveText ?? 'Confirm',
        negativeText: opts.negativeText ?? 'Cancel',
        onPositiveClick: opts.onPositiveClick,
        onNegativeClick: opts.onNegativeClick,
      }),
  };
}