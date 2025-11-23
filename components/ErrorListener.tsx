"use client"

import { GraphQLError } from 'graphql'
import { useEffect } from 'react'
import { toast } from 'sonner'

const ErrorListener = ({ error }: { error?: GraphQLError[] }) => {
    const extensions = error?.[0]?.extensions

    let message = ""

    switch (extensions?.code) {
        case "UNAUTHORIZED":
            message = "You are not authorized to perform this action."
            break
        case "RATE_LIMIT_EXCEEDED":
            const retryAfter = extensions?.retryAfter || 0
            message = `Too many requests. Try again in ${retryAfter} seconds.`
            break
        default:
            message = "An unexpected error occurred. Please try again later."
    }

    useEffect(() => {
        if (!error) return

        toast.error(message)
    }, [error, message])

    return null
}

export default ErrorListener