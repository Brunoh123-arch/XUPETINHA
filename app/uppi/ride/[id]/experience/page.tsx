"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, CheckCircle } from "lucide-react"

const MOODS = [
  { value: "excelente", label: "Excelente", emoji: "😄" },
  { value: "bom", label: "Bom",      emoji: "🙂" },
  { value: "neutro", label: "Neutro",  emoji: "😐" },
  { value: "ruim",  label: "Ruim",    emoji: "😕" },
]

const ISSUE_TYPES = [
  "Motorista imprudente", "Veículo sujo", "Rota errada",
  "Motorista mal educado", "Problema com pagamento",
  "App com falha", "Outro",
]

export default function RideExperiencePage() {
  const supabase = createClient()
  const router = useRouter()
  const params = useParams()
  const rideId = params.id as string

  const [mood, setMood] = useState("")
  const [hadIssue, setHadIssue] = useState(false)
  const [issueType, setIssueType] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!mood) return
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setSaving(false); return }
    await supabase.from("ride_experiences").insert({
      ride_id: rideId,
      user_id: user.id,
      mood,
      had_issue: hadIssue,
      issue_type: hadIssue ? issueType : null,
      issue_description: hadIssue ? issueDescription : null,
    })
    setSaving(false)
    setDone(true)
    setTimeout(() => router.push(`/uppi/ride/${rideId}`), 2000)
  }

  if (done) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <h2 className="text-xl font-bold text-foreground">Obrigado pelo feedback!</h2>
        <p className="text-muted-foreground mt-2">Sua opiniao nos ajuda a melhorar.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-xl font-bold text-foreground">Como foi sua corrida?</h1>
      </div>

      <div className="px-4 space-y-6 pb-8">
        {/* Mood */}
        <div>
          <p className="text-sm text-muted-foreground mb-3">Selecione como voce se sentiu</p>
          <div className="grid grid-cols-4 gap-3">
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                  mood === m.value ? "border-primary bg-primary/5" : "border-border bg-card"
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs font-medium text-foreground">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Problema? */}
        <div className="bg-card border border-border rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-medium text-foreground">Tive um problema nesta corrida</p>
            <button
              onClick={() => setHadIssue(!hadIssue)}
              className={`w-12 h-6 rounded-full transition-all ${hadIssue ? "bg-primary" : "bg-muted"}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full mx-0.5 transition-transform shadow ${hadIssue ? "translate-x-6" : "translate-x-0"}`} />
            </button>
          </div>

          {hadIssue && (
            <div className="space-y-3 mt-4">
              <p className="text-sm text-muted-foreground">Qual foi o problema?</p>
              <div className="flex flex-wrap gap-2">
                {ISSUE_TYPES.map(t => (
                  <button
                    key={t}
                    onClick={() => setIssueType(t)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                      issueType === t ? "border-primary bg-primary/5 text-primary" : "border-border text-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <Textarea
                placeholder="Descreva o que aconteceu (opcional)..."
                rows={3}
                value={issueDescription}
                onChange={e => setIssueDescription(e.target.value)}
              />
            </div>
          )}
        </div>

        <Button
          className="w-full h-12 text-base"
          disabled={!mood || saving}
          onClick={submit}
        >
          {saving ? "Enviando..." : "Enviar avaliacao"}
        </Button>
      </div>
    </div>
  )
}
