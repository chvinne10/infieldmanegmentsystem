"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { 
  Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, 
  Brain, Send, Sparkles, Trophy, Clock, Users, Volume2, X
} from "lucide-react"

interface Participant {
  id: number
  name: string
  isSpeaking: boolean
  micOn: boolean
  cameraOn: boolean
  speakingScore: number
  communicationScore: number
  behaviorScore: number
  speakingTime: number
}

interface ChatMessage {
  id: number
  sender: string
  message: string
  isAI: boolean
  timestamp: Date
}

const discussionTopics = [
  "Should Artificial Intelligence replace traditional jobs?",
  "Is remote work the future of employment?",
  "Should social media be regulated by governments?",
  "Is climate change the biggest threat to humanity?",
  "Should education be completely free for everyone?",
  "Are electric vehicles the solution to pollution?"
]

const aiTips = [
  "Try to maintain eye contact while speaking",
  "Use clear and concise language",
  "Listen actively to other participants",
  "Support your arguments with examples",
  "Avoid interrupting others"
]

export function MeetingInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const participantCount = parseInt(searchParams.get("participants") || "4")
  
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(true)
  const [topic, setTopic] = useState("")
  const [discussionStarted, setDiscussionStarted] = useState(false)
  const [prepTime, setPrepTime] = useState(300) // 5 minutes
  const [discussionTime, setDiscussionTime] = useState(0)
  const [myMicOn, setMyMicOn] = useState(true)
  const [myCameraOn, setMyCameraOn] = useState(true)
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  
  const [participants, setParticipants] = useState<Participant[]>([])

  // Initialize participants
  useEffect(() => {
    const names = ["You", "Alex Chen", "Sarah Miller", "David Kim", "Emma Wilson", "Michael Brown"]
    const initialParticipants: Participant[] = Array.from({ length: participantCount }, (_, i) => ({
      id: i,
      name: names[i] || `Participant ${i + 1}`,
      isSpeaking: false,
      micOn: true,
      cameraOn: true,
      speakingScore: Math.floor(Math.random() * 30) + 70,
      communicationScore: Math.floor(Math.random() * 30) + 70,
      behaviorScore: Math.floor(Math.random() * 30) + 70,
      speakingTime: 0
    }))
    setParticipants(initialParticipants)
  }, [participantCount])

  // Generate topic
  useEffect(() => {
    const timer = setTimeout(() => {
      setTopic(discussionTopics[Math.floor(Math.random() * discussionTopics.length)])
      setIsGeneratingTopic(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Prep time countdown
  useEffect(() => {
    if (!isGeneratingTopic && !discussionStarted && prepTime > 0) {
      const timer = setInterval(() => {
        setPrepTime(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isGeneratingTopic, discussionStarted, prepTime])

  // Discussion timer
  useEffect(() => {
    if (discussionStarted) {
      const timer = setInterval(() => {
        setDiscussionTime(prev => prev + 1)
        
        // Simulate random speaking
        setParticipants(prev => prev.map(p => ({
          ...p,
          isSpeaking: Math.random() > 0.7,
          speakingTime: p.isSpeaking ? p.speakingTime + 1 : p.speakingTime,
          speakingScore: Math.min(100, p.speakingScore + (Math.random() > 0.8 ? 1 : 0)),
          communicationScore: Math.min(100, p.communicationScore + (Math.random() > 0.9 ? 1 : 0)),
          behaviorScore: Math.min(100, p.behaviorScore + (Math.random() > 0.85 ? 1 : 0))
        })))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [discussionStarted])

  // Add AI tips periodically
  useEffect(() => {
    if (discussionStarted) {
      const timer = setInterval(() => {
        const tip = aiTips[Math.floor(Math.random() * aiTips.length)]
        setMessages(prev => [...prev, {
          id: Date.now(),
          sender: "AI Moderator",
          message: tip,
          isAI: true,
          timestamp: new Date()
        }])
      }, 15000)
      return () => clearInterval(timer)
    }
  }, [discussionStarted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const sendMessage = () => {
    if (chatInput.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: "You",
        message: chatInput,
        isAI: false,
        timestamp: new Date()
      }])
      setChatInput("")
    }
  }

  const handleEndMeeting = () => {
    const scores = participants.map(p => ({
      name: p.name,
      speakingScore: p.speakingScore,
      communicationScore: p.communicationScore,
      behaviorScore: p.behaviorScore,
      speakingTime: p.speakingTime
    }))
    localStorage.setItem("discussionResults", JSON.stringify(scores))
    router.push("/results")
  }

  const getRankedParticipants = () => {
    return [...participants].sort((a, b) => {
      const scoreA = (a.speakingScore + a.communicationScore + a.behaviorScore) / 3
      const scoreB = (b.speakingScore + b.communicationScore + b.behaviorScore) / 3
      return scoreB - scoreA
    })
  }

  if (isGeneratingTopic) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
            <Brain className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground">AI is generating a discussion topic...</h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>Analyzing current affairs</span>
            </div>
          </div>
          <div className="w-64 mx-auto">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-pulse w-3/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-lg flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-sm font-medium text-foreground line-clamp-1 max-w-md">{topic}</h1>
            <p className="text-xs text-muted-foreground">
              {discussionStarted ? "Discussion in progress" : "Preparation phase"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-sm font-medium">
              {discussionStarted ? formatTime(discussionTime) : `Prep: ${formatTime(prepTime)}`}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{participantCount} participants</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Grid */}
        <div className="flex-1 p-4 lg:p-6">
          {!discussionStarted ? (
            // Pre-discussion screen
            <div className="h-full flex flex-col items-center justify-center">
              <Card className="max-w-2xl w-full bg-card/80 backdrop-blur border-border/50">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto bg-primary/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-primary" />
                  </div>
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-foreground">Discussion Topic</h2>
                    <p className="text-xl text-muted-foreground leading-relaxed">{topic}</p>
                  </div>
                  <div className="pt-4">
                    <Button 
                      size="lg" 
                      onClick={() => setDiscussionStarted(true)}
                      className="px-8 h-12 text-base font-medium"
                    >
                      Start Discussion
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            // Video grid
            <div className={`grid gap-4 h-full ${
              participantCount === 1 ? "grid-cols-1" :
              participantCount === 2 ? "grid-cols-2" :
              participantCount <= 4 ? "grid-cols-2 grid-rows-2" :
              "grid-cols-3 grid-rows-2"
            }`}>
              {participants.map((participant, index) => (
                <Card 
                  key={participant.id}
                  className={`relative overflow-hidden bg-card border-2 transition-all ${
                    participant.isSpeaking ? "border-primary shadow-lg shadow-primary/20" : "border-border/50"
                  }`}
                >
                  {/* Video placeholder */}
                  <div className="absolute inset-0 bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold ${
                      index === 0 ? "bg-primary text-primary-foreground" : "bg-muted-foreground/20 text-muted-foreground"
                    }`}>
                      {participant.name.charAt(0)}
                    </div>
                  </div>

                  {/* Speaking indicator */}
                  {participant.isSpeaking && (
                    <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 bg-primary rounded-full">
                      <Volume2 className="w-3 h-3 text-primary-foreground animate-pulse" />
                      <span className="text-xs font-medium text-primary-foreground">Speaking</span>
                    </div>
                  )}

                  {/* Participant info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white">{participant.name}</span>
                      <div className="flex items-center gap-2">
                        {participant.micOn ? (
                          <Mic className="w-4 h-4 text-white" />
                        ) : (
                          <MicOff className="w-4 h-4 text-destructive" />
                        )}
                        {participant.cameraOn ? (
                          <Video className="w-4 h-4 text-white" />
                        ) : (
                          <VideoOff className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* AI Moderator Card */}
              <Card className="relative overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/30">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center">
                    <Brain className="w-10 h-10 text-primary-foreground" />
                  </div>
                </div>
                <div className="absolute top-3 left-3 px-3 py-1.5 bg-primary/80 rounded-full">
                  <span className="text-xs font-medium text-primary-foreground">AI Moderator</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-sm font-medium text-white">AI Moderator</span>
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Right Sidebar - AI Analysis */}
        {discussionStarted && (
          <aside className="hidden lg:block w-80 border-l border-border bg-card/50 backdrop-blur p-4 space-y-4 overflow-y-auto">
            {/* AI Analysis Panel */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  AI Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {participants[0] && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Speaking Score</span>
                        <span className="font-medium">{participants[0].speakingScore}%</span>
                      </div>
                      <Progress value={participants[0].speakingScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Communication</span>
                        <span className="font-medium">{participants[0].communicationScore}%</span>
                      </div>
                      <Progress value={participants[0].communicationScore} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Behavior</span>
                        <span className="font-medium">{participants[0].behaviorScore}%</span>
                      </div>
                      <Progress value={participants[0].behaviorScore} className="h-2" />
                    </div>
                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Speaking Time</span>
                        <span className="font-mono font-medium">{formatTime(participants[0].speakingTime)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Ranking Board */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-warning" />
                  Live Ranking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getRankedParticipants().slice(0, 3).map((participant, index) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? "bg-warning text-warning-foreground" :
                      index === 1 ? "bg-muted-foreground/30 text-foreground" :
                      "bg-orange-900/30 text-orange-400"
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {index === 0 ? "Best Communicator" :
                         index === 1 ? "Second Place" :
                         "Third Place"}
                      </p>
                    </div>
                    <span className="text-sm font-medium text-primary">
                      {Math.round((participant.speakingScore + participant.communicationScore + participant.behaviorScore) / 3)}%
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </aside>
        )}
      </div>

      {/* Bottom Controls */}
      <footer className="h-20 border-t border-border bg-card/80 backdrop-blur-lg flex items-center justify-center gap-4 px-4">
        <Button
          variant={myMicOn ? "secondary" : "destructive"}
          size="lg"
          onClick={() => setMyMicOn(!myMicOn)}
          className="w-14 h-14 rounded-full p-0"
        >
          {myMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>
        <Button
          variant={myCameraOn ? "secondary" : "destructive"}
          size="lg"
          onClick={() => setMyCameraOn(!myCameraOn)}
          className="w-14 h-14 rounded-full p-0"
        >
          {myCameraOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>
        <Button
          variant={chatOpen ? "default" : "secondary"}
          size="lg"
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full p-0"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
        <Button
          variant="destructive"
          size="lg"
          onClick={handleEndMeeting}
          className="w-14 h-14 rounded-full p-0"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </footer>

      {/* Chat Panel */}
      {chatOpen && (
        <div className="fixed bottom-24 right-4 w-80 h-96 bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="font-semibold">Chat</h3>
            <Button variant="ghost" size="sm" onClick={() => setChatOpen(false)} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`${msg.isAI ? "bg-primary/10 border border-primary/20" : "bg-muted"} rounded-lg p-3`}>
                  <p className="text-xs font-medium mb-1 text-primary">{msg.sender}</p>
                  <p className="text-sm">{msg.message}</p>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1"
              />
              <Button size="sm" onClick={sendMessage} className="px-3">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
