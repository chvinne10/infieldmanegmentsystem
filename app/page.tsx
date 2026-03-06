import { LoginForm } from "@/components/login-form"
import { ThemeProvider } from "@/components/theme-provider"

export default function Home() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <LoginForm />
    </ThemeProvider>
  )
}
