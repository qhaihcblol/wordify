"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Vocabulary } from "@/types"
import { Volume2, RotateCcw, CheckCircle, X, BookOpen } from "lucide-react"

interface FlashcardProps {
  vocabulary: Vocabulary
  onNext: (correct: boolean) => void
  currentIndex: number
  totalCount: number
}

export function Flashcard({ vocabulary, onNext, currentIndex, totalCount }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isAnswered, setIsAnswered] = useState(false)

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const handleAnswer = (correct: boolean) => {
    setIsAnswered(true)
    setTimeout(() => {
      onNext(correct)
      setIsFlipped(false)
      setIsAnswered(false)
    }, 500)
  }

  const speakWord = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(vocabulary.word)
      utterance.lang = "en-US"
      speechSynthesis.speak(utterance)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-700 border-red-200"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200"
    }
  }

  const progressPercentage = ((currentIndex + 1) / totalCount) * 100

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header with Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="text-sm font-medium">
              {currentIndex + 1} of {totalCount}
            </Badge>
            <Badge className={`${getDifficultyColor(vocabulary.difficulty)} border`}>{vocabulary.difficulty}</Badge>
          </div>
          <div className="text-sm text-gray-600 font-medium">{Math.round(progressPercentage)}% Complete</div>
        </div>
        <Progress value={progressPercentage} className="h-2 bg-gray-100" />
      </div>

      {/* Main Flashcard */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative">
          <Card
            className={`w-full h-80 cursor-pointer transition-all duration-500 transform hover:scale-[1.02] ${
              isFlipped ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200" : "bg-white border-gray-200"
            } ${isAnswered ? "scale-95 opacity-75" : ""} shadow-lg hover:shadow-xl`}
            onClick={handleFlip}
          >
            <CardContent className="h-full flex flex-col items-center justify-center p-8 text-center relative">
              {/* Flip indicator */}
              <div className="absolute top-4 right-4">
                <div className="p-2 bg-gray-100 rounded-full">
                  <RotateCcw className="h-4 w-4 text-gray-500" />
                </div>
              </div>

              {!isFlipped ? (
                // Front of card - Word
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-blue-500 mr-3" />
                    <span className="text-lg font-medium text-gray-600">Word to Learn</span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-center space-x-3">
                      <h2 className="text-5xl font-bold text-gray-900 tracking-wide">{vocabulary.word}</h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          speakWord()
                        }}
                        className="p-3 hover:bg-blue-100 rounded-full"
                      >
                        <Volume2 className="h-6 w-6 text-blue-600" />
                      </Button>
                    </div>
                    <p className="text-xl text-blue-600 font-medium">{vocabulary.pronunciation}</p>
                  </div>

                  <div className="mt-8">
                    <p className="text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full inline-block">
                      Click to see meaning & example
                    </p>
                  </div>
                </div>
              ) : (
                // Back of card - Meaning and example
                <div className="space-y-6 w-full">
                  <div className="flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                    <span className="text-lg font-medium text-gray-600">Definition & Example</span>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Meaning</h3>
                      <p className="text-gray-700 leading-relaxed">{vocabulary.meaning}</p>
                    </div>

                    <div className="bg-white rounded-lg p-4 border border-blue-100">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Example</h3>
                      <p className="text-gray-700 italic leading-relaxed">"{vocabulary.example}"</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 space-y-4">
          {!isFlipped ? (
            <div className="flex justify-center">
              <Button
                onClick={handleFlip}
                variant="outline"
                size="lg"
                className="px-8 py-3 text-base font-medium border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <RotateCcw className="mr-2 h-5 w-5" />
                Show Meaning
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-center">
                <p className="text-gray-600 font-medium mb-3">How well do you know this word?</p>
              </div>
              <div className="flex justify-center space-x-4">
                <Button
                  onClick={() => handleAnswer(false)}
                  variant="outline"
                  size="lg"
                  className="px-6 py-3 text-base font-medium border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                  disabled={isAnswered}
                >
                  <X className="mr-2 h-5 w-5" />
                  Need Practice
                </Button>
                <Button
                  onClick={() => handleAnswer(true)}
                  size="lg"
                  className="px-6 py-3 text-base font-medium bg-green-600 hover:bg-green-700 text-white"
                  disabled={isAnswered}
                >
                  <CheckCircle className="mr-2 h-5 w-5" />I Know This!
                </Button>
              </div>
              <div className="flex justify-center mt-3">
                <Button onClick={handleFlip} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Show Word Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
