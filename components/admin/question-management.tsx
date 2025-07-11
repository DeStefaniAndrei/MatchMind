"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Plus, Check, X } from "lucide-react"

interface PendingQuestion {
  id: string
  matchId: string
  text: string
  options: string[]
  submittedAt: string
}

export function QuestionManagement() {
  const [pendingQuestions] = useState<PendingQuestion[]>([
    {
      id: "1",
      matchId: "1",
      text: "Will there be a red card in the next 10 minutes?",
      options: ["Yes", "No"],
      submittedAt: "2024-01-15T14:30:00Z",
    },
    {
      id: "2",
      matchId: "1",
      text: "Which player will touch the ball next?",
      options: ["Midfielder", "Defender", "Forward"],
      submittedAt: "2024-01-15T14:25:00Z",
    },
  ])

  const [newQuestion, setNewQuestion] = useState("")
  const [newOptions, setNewOptions] = useState(["", ""])
  const { toast } = useToast()

  const handleApproveQuestion = (questionId: string) => {
    toast({
      title: "Question Approved",
      description: "Question has been approved and will be used in the match",
    })
  }

  const handleRejectQuestion = (questionId: string) => {
    toast({
      title: "Question Rejected",
      description: "Question has been rejected and removed from queue",
      variant: "destructive",
    })
  }

  const handleAddOption = () => {
    setNewOptions([...newOptions, ""])
  }

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...newOptions]
    updated[index] = value
    setNewOptions(updated)
  }

  const handleSubmitQuestion = () => {
    if (!newQuestion.trim() || newOptions.some((opt) => !opt.trim())) {
      toast({
        title: "Invalid Question",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Question Submitted",
      description: "New question has been added to the approval queue",
    })

    setNewQuestion("")
    setNewOptions(["", ""])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Question Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pending Questions */}
        <div>
          <h4 className="font-semibold mb-3">Pending Approval</h4>
          <div className="space-y-3">
            {pendingQuestions.map((question) => (
              <div key={question.id} className="border rounded-lg p-3">
                <p className="font-medium mb-2">{question.text}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {question.options.map((option, index) => (
                    <span key={index} className="px-2 py-1 bg-muted rounded text-sm">
                      {option}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveQuestion(question.id)}
                    className="flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleRejectQuestion(question.id)}
                    className="flex items-center gap-1"
                  >
                    <X className="h-3 w-3" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Question */}
        <div>
          <h4 className="font-semibold mb-3">Add New Question</h4>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question Text</Label>
              <Textarea
                id="question"
                placeholder="Enter your question..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>

            <div>
              <Label>Answer Options</Label>
              <div className="space-y-2">
                {newOptions.map((option, index) => (
                  <Input
                    key={index}
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                  className="flex items-center gap-1 bg-transparent"
                >
                  <Plus className="h-3 w-3" />
                  Add Option
                </Button>
              </div>
            </div>

            <Button onClick={handleSubmitQuestion} className="w-full">
              Submit Question
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
