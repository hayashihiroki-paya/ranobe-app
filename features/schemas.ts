import { z } from "zod"

const emailSchema = z
  .string()
  .trim()
  .min(1, "メールアドレスを入力してください")
  .max(254, "メールアドレスは254文字以内で入力してください")
  .email("メールアドレスの形式を確認してください")

const passwordSchema = z
  .string()
  .min(1, "パスワードを入力してください")
  .min(6, "パスワードは6文字以上で入力してください")
  .refine(
    (password) => new TextEncoder().encode(password).length <= 72,
    "パスワードは72バイト以内で入力してください",
  )

export const loginFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registrationFormSchema = loginFormSchema.extend({
  name: z
    .string()
    .trim()
    .min(1, "名前を入力してください")
    .max(100, "名前は100文字以内で入力してください"),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegistrationFormValues = z.infer<typeof registrationFormSchema>
