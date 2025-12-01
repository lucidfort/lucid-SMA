"use client";

import { Form } from "@/components/ui/form";
import { SignInSchema, signInSchema } from "@/lib/validation";
import { useClerk, useSignIn } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import InputField, { FormFieldType } from "../InputField";

const SigninForm = () => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { signIn, isLoaded } = useSignIn()
    const { setActive } = useClerk()

    const form = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            username: "",
            password: "",
        },
    });

    const onSubmit = form.handleSubmit(async (values) => {
        if (!isLoaded) return;

        try {
            setIsLoading(true)

            const attempt = await signIn.create({
                identifier: values.username,
                password: values.password
            })

            if (attempt.status === "complete") {
                await setActive({ session: attempt.createdSessionId });
                router.refresh()
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : String(error))
        } finally {
            setIsLoading(false)
        }
    });

    return (
        <Form {...form}>
            <form className="flex flex-col gap-4" onSubmit={onSubmit}>
                <div className="flex flex-col w-full gap-4">
                    <InputField
                        label="Username"
                        name="username"
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                    />
                    <InputField
                        label="Password"
                        name="password"
                        type="password"
                        control={form.control}
                        fieldType={FormFieldType.INPUT}
                    />

                    {error && (
                        <p className="text-sm text-red-500">{error}</p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={!form.formState.isDirty || isLoading}
                    className="form-submit_btn mt-5"
                >
                    {!isLoading ? (
                        <span>Sign In</span>
                    ) : (
                        <Loader2 className="animate-spin text-lamaYellow" />
                    )}
                </button>
            </form>
        </Form>
    );
};

export default SigninForm;
