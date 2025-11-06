import { Toaster as Sonner } from "sonner"

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-950 group-[.toaster]:border group-[.toaster]:shadow-lg group-[.toaster]:rounded-lg",
          description: "group-[.toast]:text-gray-600",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-white group-[.toast]:hover:bg-primary/90",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:hover:bg-gray-200",
          // Custom colors for each type
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200 [&>div>svg]:text-green-600",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200 [&>div>svg]:text-red-600",
          warning:
            "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200 [&>div>svg]:text-yellow-600",
          info:
            "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200 [&>div>svg]:text-blue-600",
          loading:
            "group-[.toaster]:bg-gray-50 group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 [&>div>svg]:text-gray-600",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
