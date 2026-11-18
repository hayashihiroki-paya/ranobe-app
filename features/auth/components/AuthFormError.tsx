type Props = {
  id: string
  message?: string
}

export default function AuthFormError({ id, message }: Props) {
  if (!message) return null

  return (
    <p id={id} role="alert" className="mt-1 text-sm text-red-600">
      {message}
    </p>
  )
}
