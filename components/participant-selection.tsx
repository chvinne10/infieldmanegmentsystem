"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Users, UsersRound, Brain, ArrowRight } from "lucide-react"

const participantOptions = [
  {
    id: 1,
    label: "One Member",
    count: 1,
    icon: User,
    description: "Practice solo with AI feedback"
  },
  {
    id: 2,
    label: "Two Members",
    count: 2,
    icon: Users,
    description: "One-on-one discussion practice"
  },
  {
    id: 3,
    label: "Three Members",
    count: 3,
    icon: UsersRound,
    description: "Small group dynamics"
  },
  {
    id: 4,
    label: "Group Discussion",
    count: 4,
    icon: UsersRound,
    description: "4+ members for full experience"
  }
]

export function ParticipantSelection() {
  const [selected, setSelected] = useState<number | null>(null)
  const router = useRouter()

  const handleContinue = () => {
    if (selected) {
      router.push(`/meeting?participants=${selected}`)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-6 shadow-lg">
            <Brain className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Select Discussion Format
          </h1>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Choose the number of participants for your AI-monitored discussion session
          </p>
        </div>

        {/* Participant Options Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
          {participantOptions.map((option) => {
            const Icon = option.icon
            const isSelected = selected === option.count
            
            return (
              <Card
                key={option.id}
                onClick={() => setSelected(option.count)}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-2 ${
                  isSelected 
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/20" 
                    : "border-border/50 bg-card/80 hover:border-primary/50"
                }`}
              >
                <CardContent className="p-6 text-center">
                  {/* Avatar Display */}
                  <div className="flex justify-center items-center gap-1 mb-4 h-20">
                    {Array.from({ length: Math.min(option.count, 4) }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          isSelected 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}
                        style={{
                          transform: option.count > 2 ? `translateX(${(i - (option.count - 1) / 2) * -8}px)` : undefined,
                          zIndex: option.count - i
                        }}
                      >
                        <User className="w-6 h-6" />
                      </div>
                    ))}
                    {option.count > 4 && (
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold ${
                        isSelected 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted text-muted-foreground"
                      }`}>
                        +
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <h3 className={`font-semibold text-lg mb-2 ${
                    isSelected ? "text-primary" : "text-foreground"
                  }`}>
                    {option.label}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>

                  {/* Selection indicator */}
                  <div className={`mt-4 w-6 h-6 rounded-full border-2 mx-auto flex items-center justify-center transition-all ${
                    isSelected 
                      ? "border-primary bg-primary" 
                      : "border-muted-foreground/30"
                  }`}>
                    {isSelected && (
                      <svg className="w-4 h-4 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selected}
            className="px-8 h-12 text-base font-medium gap-2"
          >
            Continue to Discussion
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
