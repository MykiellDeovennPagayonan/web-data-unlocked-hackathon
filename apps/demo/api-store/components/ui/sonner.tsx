"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-text-primary group-[.toaster]:border-border-light group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-text-secondary",
          actionButton:
            "group-[.toast]:bg-kaggle-blue group-[.toast]:text-white",
          cancelButton:
            "group-[.toast]:bg-surface-muted group-[.toast]:text-text-secondary",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
