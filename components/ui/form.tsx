import * as React from "react"
import { useFormContext } from "react-hook-form"

const Form = ({ children, ...props }: React.FormHTMLAttributes<HTMLFormElement>) => {
    return <form {...props}>{children}</form>
}

const FormField = ({
    name,
    render,
}: {
    name: string
    render: (field: any) => React.ReactNode
}) => {
    const { register, formState: { errors } } = useFormContext()
    return render({ ...register(name), error: errors[name] })
}

const FormItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = "", ...props }, ref) => (
    <div ref={ref} className={`space-y-2 ${className}`} {...props} />
))
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<
    HTMLLabelElement,
    React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className = "", ...props }, ref) => (
    <label
        ref={ref}
        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`}
        {...props}
    />
))
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ ...props }, ref) => <div ref={ref} {...props} />)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className = "", ...props }, ref) => (
    <p
        ref={ref}
        className={`text-sm text-gray-600 ${className}`}
        {...props}
    />
))
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement> & { error?: any }
>(({ className = "", error, children, ...props }, ref) => {
    const message = error?.message || children
    if (!message) return null

    return (
        <p
            ref={ref}
            className={`text-sm font-medium text-red-500 ${className}`}
            {...props}
        >
            {String(message)}
        </p>
    )
})
FormMessage.displayName = "FormMessage"

export {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormDescription,
    FormMessage,
}
