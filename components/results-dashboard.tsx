"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { 
  Brain, Trophy, MessageSquare, Users, Lightbulb, 
  ArrowRight, RotateCcw, Home, Star, Target, Zap
} from "lucide-react"

interface ParticipantResult {
  name: string
  speakingScore: number
  communicationScore: number
  behaviorScore: number
  speakingTime: number
}

const improvementTips = [
  {
    icon: Target,
    title: "Maintain Eye Contact",
    description: "Look at your audience while speaking to build trust and engagement."
  },
  {
    icon: MessageSquare,
    title: "Active Listening",
    description: "Show that you're engaged by nodding and responding to others' points."
  },
  {
    icon: Zap,
    title: "Speak with Confidence",
    description: "Project your voice clearly and avoid filler words like 'um' and 'uh'."
  },
  {
    icon: Users,
    title: "Respect Others",
    description: "Wait for others to finish speaking before making your point."
  }
]

const aiFeedback: Record<string, string[]> = {
  excellent: [
    "Outstanding communication skills demonstrated throughout the discussion.",
    "You showed excellent leadership qualities and helped guide the conversation.",
    "Your points were well-structured and supported with clear examples."
  ],
  good: [
    "You communicated clearly but could improve on listening skills.",
    "Good participation overall, try to engage more with opposing viewpoints.",
    "Consider using more concrete examples to support your arguments."
  ],
  average: [
    "Try to speak more confidently and project your voice.",
    "Work on engaging with other participants' points more actively.",
    "Consider structuring your arguments more clearly before speaking."
  ]
}

export function ResultsDashboard() {
  const router = useRouter()
  const [results, setResults] = useState<ParticipantResult[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem("discussionResults")
    if (stored) {
      setResults(JSON.parse(stored))
    } else {
      // Demo data if no results
      setResults([
        { name: "You", speakingScore: 85, communicationScore: 78, behaviorScore: 92, speakingTime: 180 },
        { name: "Alex Chen", speakingScore: 72, communicationScore: 88, behaviorScore: 75, speakingTime: 150 },
        { name: "Sarah Miller", speakingScore: 90, communicationScore: 85, behaviorScore: 88, speakingTime: 200 },
        { name: "David Kim", speakingScore: 68, communicationScore: 72, behaviorScore: 80, speakingTime: 120 }
      ])
    }
    setIsLoading(false)
  }, [])

  const getRankedResults = () => {
    return [...results].sort((a, b) => {
      const scoreA = (a.speakingScore + a.communicationScore + a.behaviorScore) / 3
      const scoreB = (b.speakingScore + b.communicationScore + b.behaviorScore) / 3
      return scoreB - scoreA
    })
  }

  const getOverallScore = (p: ParticipantResult) => {
    return Math.round((p.speakingScore + p.communicationScore + p.behaviorScore) / 3)
  }

  const getFeedback = (score: number) => {
    if (score >= 85) return aiFeedback.excellent[Math.floor(Math.random() * aiFeedback.excellent.length)]
    if (score >= 70) return aiFeedback.good[Math.floor(Math.random() * aiFeedback.good.length)]
    return aiFeedback.average[Math.floor(Math.random() * aiFeedback.average.length)]
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return { color: "bg-warning text-warning-foreground", label: "1st Place", icon: "🥇" }
    if (index === 1) return { color: "bg-muted-foreground/30 text-foreground", label: "2nd Place", icon: "🥈" }
    if (index === 2) return { color: "bg-orange-900/30 text-orange-400", label: "3rd Place", icon: "🥉" }
    return { color: "bg-muted text-muted-foreground", label: `${index + 1}th Place`, icon: "" }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const rankedResults = getRankedResults()

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg">
            <Trophy className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Discussion Results
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Here is your performance summary and AI-powered feedback
          </p>
        </div>

        {/* Participant Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          {rankedResults.map((participant, index) => {
            const badge = getRankBadge(index)
            const overallScore = getOverallScore(participant)
            
            return (
              <Card 
                key={participant.name}
                className={`bg-card/80 backdrop-blur border-border/50 overflow-hidden transition-all hover:shadow-lg ${
                  index === 0 ? "md:col-span-2 border-primary/30" : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Rank Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold shrink-0 ${badge.color}`}>
                      {badge.icon || index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{participant.name}</h3>
                          <p className="text-sm text-muted-foreground">{badge.label}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{overallScore}%</div>
                          <p className="text-xs text-muted-foreground">Overall Score</p>
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Speaking</span>
                            <span className="font-medium">{participant.speakingScore}%</span>
                          </div>
                          <Progress value={participant.speakingScore} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Communication</span>
                            <span className="font-medium">{participant.communicationScore}%</span>
                          </div>
                          <Progress value={participant.communicationScore} className="h-1.5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Behavior</span>
                            <span className="font-medium">{participant.behaviorScore}%</span>
                          </div>
                          <Progress value={participant.behaviorScore} className="h-1.5" />
                        </div>
                      </div>

                      {/* AI Feedback */}
                      <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Brain className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-sm text-muted-foreground">{getFeedback(overallScore)}</p>
                        </div>
                      </div>

                      {/* Speaking Time */}
                      <div className="mt-3 text-xs text-muted-foreground">
                        Speaking time: <span className="font-medium text-foreground">{formatTime(participant.speakingTime)}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* AI Improvement Tips */}
        <Card className="max-w-4xl mx-auto bg-card/80 backdrop-blur border-border/50 mb-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-warning" />
              AI Improvement Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {improvementTips.map((tip, index) => {
                const Icon = tip.icon
                return (
                  <div 
                    key={index}
                    className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground mb-1">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground">{tip.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={() => router.push("/")}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
          <Button
            size="lg"
            onClick={() => router.push("/select-participants")}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Start New Discussion
          </Button>
        </div>
      </div>
    </div>
  )
}
