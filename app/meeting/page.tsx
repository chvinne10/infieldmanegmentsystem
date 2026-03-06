import { Suspense } from "react"
import { MeetingInterface } from "@/components/meeting-interface"
import { ThemeProvider } from "@/components/theme-provider"

function MeetingContent() {
  return <MeetingInterface />
}

export default function MeetingPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <Suspense fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <MeetingContent />
      </Suspense>
    </ThemeProvider>
  )
}
