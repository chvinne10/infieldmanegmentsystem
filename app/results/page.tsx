import { ResultsDashboard } from "@/components/results-dashboard"
import { ThemeProvider } from "@/components/theme-provider"

export default function ResultsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ResultsDashboard />
    </ThemeProvider>
  )
}
