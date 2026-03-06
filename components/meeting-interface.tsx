"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Mic, MicOff, Video, VideoOff, MessageSquare, PhoneOff, 
  Brain, Send, Sparkles, X, Clock, Users
} from "lucide-react"


interface ChatMessage {
  id: number
  sender: string
  message: string
  isAI: boolean
  timestamp: Date
}

import type { ParticipantResult } from "./results-dashboard";

const discussionTopics = [
  "Should Artificial Intelligence replace traditional jobs?",
  "Is remote work the future of employment?",
  "Should social media be regulated by governments?",
  "Is climate change the biggest threat to humanity?",
  "Should education be completely free for everyone?",
  "Are electric vehicles the solution to pollution?"
]


export function MeetingInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const participantCount = parseInt(searchParams.get("participants") || "4")
  
  // discussion/topic state (for pre-meeting experience)
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(true);
  const [topic, setTopic] = useState("");
  const [discussionStarted, setDiscussionStarted] = useState(false);
  const [prepTime, setPrepTime] = useState(300);
  const [discussionTime, setDiscussionTime] = useState(0);
  const [localSpeakingTime, setLocalSpeakingTime] = useState(0);

  const [roomId, setRoomId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ id: string; stream: MediaStream }[]>([]);
  const [myMicOn, setMyMicOn] = useState(true);
  const [myCameraOn, setMyCameraOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const pcMap = useRef<{ [key: string]: RTCPeerConnection }>({});
  const socketRef = useRef<any>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  // set up room id, signaling and media on mount
  useEffect(() => {
    let id = searchParams.get("room");
    if (!id) {
      id = `room-${Math.random().toString(36).substr(2, 9)}`;
      // optionally update URL
      router.replace(`/meeting?room=${id}&participants=${participantCount}`);
    }
    setRoomId(id);

    const socket = require("socket.io-client")("http://localhost:3001");
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join-room", id);
    });

    socket.on("user-joined", (peerId: string) => {
      callNewUser(peerId);
    });

    socket.on("offer", async ({ from, sdp }: any) => {
      // create PC and answer even if localStream not ready; tracks will be added later
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, sdp: pc.localDescription });
    });

    socket.on("answer", async ({ from, sdp }: any) => {
      const pc = pcMap.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(sdp));
      }
    });

    socket.on("ice-candidate", async ({ from, candidate }: any) => {
      const pc = pcMap.current[from];
      if (pc && candidate) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socket.on("user-left", (peerId: string) => {
      removePeer(peerId);
    });

    // get user media
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
      setLocalStream(stream);
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    }).catch(console.error);

    return () => {
      socket.disconnect();
      Object.values(pcMap.current).forEach(pc => pc.close());
      localStream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  // topic generation via OpenAI API
  useEffect(() => {
    setIsGeneratingTopic(true);
    // call backend service for topic generation; backend runs on port 3001
    fetch('http://localhost:3001/api/topic', {
      method: 'POST'
    })
      .then(res => res.json())
      .then(data => {
        if (data.topic) {
          setTopic(data.topic);
        } else {
          setTopic(discussionTopics[Math.floor(Math.random() * discussionTopics.length)]);
        }
      })
      .catch(err => {
        console.error('failed to load topic', err);
        setTopic(discussionTopics[Math.floor(Math.random() * discussionTopics.length)]);
      })
      .finally(() => setIsGeneratingTopic(false));
  }, []);

  // prep countdown
  useEffect(() => {
    if (!isGeneratingTopic && !discussionStarted && prepTime > 0) {
      const timer = setInterval(() => {
        setPrepTime(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGeneratingTopic, discussionStarted, prepTime]);

  // local speaking timer (approximate by mic enabled during discussion)
  useEffect(() => {
    if (discussionStarted && myMicOn) {
      const timer = setInterval(() => {
        setLocalSpeakingTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [discussionStarted, myMicOn]);

  // discussion timer
  useEffect(() => {
    if (discussionStarted) {
      const timer = setInterval(() => {
        setDiscussionTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [discussionStarted]);

  // update tracks when toggles change
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(t => t.enabled = myMicOn);
      localStream.getVideoTracks().forEach(t => t.enabled = myCameraOn);
    }
  }, [myMicOn, myCameraOn, localStream]);

  useEffect(() => {
    remoteStreams.forEach(r => {
      const vid = remoteVideoRefs.current[r.id];
      if (vid && vid.srcObject !== r.stream) {
        vid.srcObject = r.stream;
      }
    });
  }, [remoteStreams]);

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection();
    pcMap.current[peerId] = pc;

    const stream = localStreamRef.current;
    if (stream) {
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    }

    pc.onicecandidate = event => {
      if (event.candidate) {
        socketRef.current.emit("ice-candidate", { to: peerId, candidate: event.candidate });
      }
    };

    pc.ontrack = event => {
      const [stream] = event.streams;
      setRemoteStreams(prev => {
        if (prev.find(r => r.id === peerId)) return prev;
        return [...prev, { id: peerId, stream }];
      });
    };

    return pc;
  };

  const callNewUser = async (peerId: string) => {
    const pc = createPeerConnection(peerId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socketRef.current.emit("offer", { to: peerId, sdp: pc.localDescription });
  };

  const removePeer = (peerId: string) => {
    const pc = pcMap.current[peerId];
    if (pc) {
      pc.close();
      delete pcMap.current[peerId];
    }
    setRemoteStreams(prev => prev.filter(r => r.id !== peerId));
    delete remoteVideoRefs.current[peerId];
  };

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
    // generate results for each participant (local user + simulated others)
    const results: ParticipantResult[] = [];

    const calcScore = (base: number, variance = 10) => {
      let val = base + (Math.random() * variance * 2 - variance);
      if (val < 0) val = 0;
      if (val > 100) val = 100;
      return Math.round(val);
    };

    const userBase = discussionTime > 0 ? (localSpeakingTime / discussionTime) * 100 : 0;
    results.push({
      name: "You",
      speakingScore: calcScore(userBase, 15),
      communicationScore: calcScore(userBase, 15),
      behaviorScore: calcScore(80, 20),
      speakingTime: localSpeakingTime
    });

    const otherNames = [
      "Alex Chen",
      "Sarah Miller",
      "David Kim",
      "Emma Lee",
      "Maya Patel",
      "Liam Nguyen",
      "Olivia Brown"
    ];
    const othersCount = participantCount - 1;
    for (let i = 0; i < othersCount; i++) {
      const randomTime = Math.floor(Math.random() * discussionTime);
      results.push({
        name: otherNames[i] || `Participant ${i + 2}`,
        speakingScore: Math.round(60 + Math.random() * 40),
        communicationScore: Math.round(60 + Math.random() * 40),
        behaviorScore: Math.round(60 + Math.random() * 40),
        speakingTime: randomTime
      });
    }

    localStorage.setItem("discussionResults", JSON.stringify(results));
    router.push("/results");
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
          {discussionStarted && (
            <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
              <Mic className="w-4 h-4 text-muted-foreground" />
              <span className="font-mono text-sm font-medium">{formatTime(localSpeakingTime)}</span>
            </div>
          )}
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
            // Real video grid
            <div className={`grid gap-4 h-full ${
              remoteStreams.length + (localStream ? 1 : 0) === 1 ? "grid-cols-1" :
              remoteStreams.length + (localStream ? 1 : 0) === 2 ? "grid-cols-2" :
              remoteStreams.length + (localStream ? 1 : 0) <= 4 ? "grid-cols-2 grid-rows-2" :
              "grid-cols-3 grid-rows-2"
            }`}>
              {localStream && (
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full bg-black rounded-lg"
                />
              )}
              {remoteStreams.map(r => (
                <video
                  key={r.id}
                  ref={el => { if (el) remoteVideoRefs.current[r.id] = el }}
                  autoPlay
                  playsInline
                  className="w-full h-full bg-black rounded-lg"
                />
              ))}
            </div>
          )}
        </div>

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
