"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { vocabularyAPI } from "@/lib/api"
import type { Topic, Vocabulary } from "@/types"
import { ArrowLeft, BookOpen, Edit, Plus, Trash2, Volume2 } from "lucide-react"
import { useEffect, useState } from "react"

interface VocabularyManagementProps {
  topic: Topic
  onBack: () => void
  onVocabularyUpdate?: () => void // Add callback to update topic list
}

export function VocabularyManagement({ topic, onBack, onVocabularyUpdate }: VocabularyManagementProps) {
  const [vocabulary, setVocabulary] = useState<Vocabulary[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingVocabulary, setEditingVocabulary] = useState<Vocabulary | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    word: "",
    pronunciation: "",
    meaning: "",
    example: "",
    difficulty: "medium" as "easy" | "medium" | "hard",
  })

  useEffect(() => {
    loadVocabulary()
  }, [topic.id])

  const loadVocabulary = async () => {
    try {
      const data = await vocabularyAPI.getByTopic(topic.id)
      setVocabulary(data)
    } catch (error) {
      console.error("Failed to load vocabulary:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (editingVocabulary) {
        await vocabularyAPI.update(editingVocabulary.id, formData)
      } else {
        await vocabularyAPI.create({
          ...formData,
          topicId: topic.id,
        })
      }

      await loadVocabulary()
      onVocabularyUpdate?.() // Update topic list to reflect new vocabulary count
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save vocabulary:", error)
      let errorMessage = "Failed to save vocabulary"

      if (error instanceof Error) {
        // Customize error messages for better UX
        if (error.message.includes("unique set") || error.message.includes("already exists")) {
          errorMessage = "This word already exists in this topic. Please choose a different word."
        } else if (error.message.includes("word")) {
          errorMessage = "Please check the word and try again."
        } else {
          errorMessage = error.message
        }
      }

      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (vocab: Vocabulary) => {
    setEditingVocabulary(vocab)
    setFormData({
      word: vocab.word,
      pronunciation: vocab.pronunciation,
      meaning: vocab.meaning,
      example: vocab.example,
      difficulty: vocab.difficulty,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vocabulary?")) {
      setDeletingId(id)
      try {
        await vocabularyAPI.delete(id)
        await loadVocabulary()
        onVocabularyUpdate?.() // Update topic list to reflect new vocabulary count
      } catch (error) {
        console.error("Failed to delete vocabulary:", error)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      word: "",
      pronunciation: "",
      meaning: "",
      example: "",
      difficulty: "medium",
    })
    setEditingVocabulary(null)
    setFormError(null)
    setIsSubmitting(false)
  }

  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      speechSynthesis.speak(utterance)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "hard":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading vocabulary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Topics</span>
            </Button>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topic.color }} />
                <h1 className="text-2xl font-bold text-gray-900">{topic.name}</h1>
              </div>
              <p className="text-gray-600">{topic.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{vocabulary.length}</div>
              <div className="text-sm text-gray-500">Total Words</div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Vocabulary
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingVocabulary ? "Edit Vocabulary" : "Add New Vocabulary"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="word">Word *</Label>
                      <Input
                        id="word"
                        value={formData.word}
                        onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                        placeholder="Enter the word"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pronunciation">Pronunciation *</Label>
                      <Input
                        id="pronunciation"
                        value={formData.pronunciation}
                        onChange={(e) => setFormData({ ...formData, pronunciation: e.target.value })}
                        placeholder="e.g., /ˈwɜːrd/"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meaning">Meaning *</Label>
                    <Textarea
                      id="meaning"
                      value={formData.meaning}
                      onChange={(e) => setFormData({ ...formData, meaning: e.target.value })}
                      placeholder="Enter the meaning or definition"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="example">Example Sentence *</Label>
                    <Textarea
                      id="example"
                      value={formData.example}
                      onChange={(e) => setFormData({ ...formData, example: e.target.value })}
                      placeholder="Provide an example sentence using this word"
                      rows={2}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty Level</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value: "easy" | "medium" | "hard") =>
                        setFormData({ ...formData, difficulty: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <p className="text-sm text-red-600">{formError}</p>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>{editingVocabulary ? "Updating..." : "Creating..."}</span>
                        </div>
                      ) : (
                        editingVocabulary ? "Update" : "Create"
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Vocabulary Grid */}
      {vocabulary.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No vocabulary yet</h3>
            <p className="text-gray-600 mb-4">Start building your vocabulary collection for this topic.</p>
            <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Add First Word
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vocabulary.map((vocab) => (
            <Card
              key={vocab.id}
              className="hover:shadow-lg transition-all duration-200 border-l-4"
              style={{ borderLeftColor: topic.color }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CardTitle className="text-xl font-bold text-gray-900">{vocab.word}</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => speakWord(vocab.word)}
                      className="h-8 w-8 p-0 hover:bg-gray-100"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Badge className={getDifficultyColor(vocab.difficulty)}>{vocab.difficulty}</Badge>
                </div>
                <CardDescription className="text-blue-600 font-medium">{vocab.pronunciation}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Meaning</h4>
                  <p className="text-gray-700 text-sm">{vocab.meaning}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Example</h4>
                  <p className="text-gray-700 text-sm italic">"{vocab.example}"</p>
                </div>
                <div className="flex justify-end space-x-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(vocab)}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(vocab.id)}
                    disabled={deletingId === vocab.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === vocab.id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
