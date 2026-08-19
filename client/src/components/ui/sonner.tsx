import { Toaster as Sonner } from 'sonner';

import { useUiStore } from '@/stores/ui-store';

type ToasterProps = React.ComponentProps<typeof Sonner>;

/** Follows the app's own theme store (the app has no next-themes provider). */
const Toaster = ({ ...props }: ToasterProps): React.JSX.Element => {
  const theme = useUiStore((s) => s.theme);

  return (
    <Sonner
      theme={theme}
      position="bottom-right"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:rounded-xl group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:bg-card group-[.toaster]:text-foreground group-[.toaster]:shadow-panel',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:rounded-lg group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:rounded-lg group-[.toast]:bg-secondary group-[.toast]:text-secondary-foreground',
          success: 'group-[.toaster]:[&_[data-icon]]:text-success',
          error: 'group-[.toaster]:[&_[data-icon]]:text-destructive',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
