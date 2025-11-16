import * as React from "react"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = "", variant = "default", ...props }, ref) => {
        const variantClasses = {
            default: "bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 text-white hover:opacity-90",
            outline: "border-2 border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
        }

        return (
            <button
                className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantClasses[variant]} ${className}`}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
