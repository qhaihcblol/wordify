"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import type { Topic } from "@/types"
import { ArrowLeft, Brain, Clock, Target, Zap } from "lucide-react"

interface QuizSetupProps {
  topic: Topic
  onBack: () => void
  onStartQuiz: (questionCount: number, mode: "multiple-choice" | "typing") => void
}

export function QuizSetup({ topic, onBack, onStartQuiz }: QuizSetupProps) {
  const [questionCount, setQuestionCount] = useState("10")
  const [quizMode, setQuizMode] = useState<"multiple-choice" | "typing">("multiple-choice")

  const questionOptions = [
    { value: "5", label: "5 Questions", time: "2-3 min", difficulty: "Quick" },
    { value: "10", label: "10 Questions", time: "5-7 min", difficulty: "Standard" },
    { value: "15", label: "15 Questions", time: "8-10 min", difficulty: "Extended" },
    { value: "20", label: "20 Questions", time: "12-15 min", difficulty: "Challenge" },
  ]

  const modeOptions = [
    {
      value: "multiple-choice",
      label: "Multiple Choice",
      description: "Choose the correct word from 4 options",
      icon: <Target className="h-5 w-5" />,
      difficulty: "Easier",
    },
    {
      value: "typing",
      label: "Type the Word",
      description: "Type the correct word based on the definition",
      icon: <Zap className="h-5 w-5" />,
      difficulty: "Harder",
    },
  ]

  const handleStartQuiz = () => {
    onStartQuiz(Number.parseInt(questionCount), quizMode)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Quiz Setup</h1>
            <p className="text-gray-600">Configure your quiz preferences</p>
          </div>
          <div className="w-20"></div> {/* Spacer */}
        </div>

        {/* Topic Info */}
        <Card className="border-l-4" style={{ borderLeftColor: topic.color }}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                style={{ backgroundColor: topic.color }}
              >
                <Brain className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{topic.name}</h2>
                <p className="text-gray-600">{topic.description}</p>
              </div>
              <Badge variant="outline" className="text-sm">
                {topic.vocabularyCount} words available
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Question Count Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>Number of Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={questionCount} onValueChange={setQuestionCount} className="space-y-3">
                {questionOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={`count-${option.value}`} />
                    <Label htmlFor={`count-${option.value}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">Estimated time: {option.time}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {option.difficulty}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Quiz Mode Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <span>Quiz Mode</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={quizMode}
                onValueChange={(value) => setQuizMode(value as "multiple-choice" | "typing")}
                className="space-y-3"
              >
                {modeOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3">
                    <RadioGroupItem value={option.value} id={`mode-${option.value}`} />
                    <Label htmlFor={`mode-${option.value}`} className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gray-100 rounded-lg">{option.icon}</div>
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ${option.value === "typing" ? "border-orange-200 text-orange-700" : "border-green-200 text-green-700"}`}
                        >
                          {option.difficulty}
                        </Badge>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Quiz Preview */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Quiz Preview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center justify-center space-x-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">
                    {questionCount} {quizMode === "multiple-choice" ? "multiple choice" : "typing"} questions
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">
                    {questionOptions.find((opt) => opt.value === questionCount)?.time} estimated
                  </span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <Brain className="h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">{topic.name} vocabulary</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Quiz Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartQuiz}
            size="lg"
            className="px-8 py-4 text-lg font-medium text-white shadow-lg hover:shadow-xl transition-all duration-200"
            style={{ backgroundColor: topic.color }}
          >
            <Brain className="mr-2 h-5 w-5" />
            Start Quiz
          </Button>
        </div>
      </div>
    </div>
  )
}
