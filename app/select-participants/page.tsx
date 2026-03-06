import { ParticipantSelection } from "@/components/participant-selection"
import { ThemeProvider } from "@/components/theme-provider"

export default function SelectParticipantsPage() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <ParticipantSelection />
    </ThemeProvider>
  )
}
