"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { topicsAPI } from "@/lib/api"
import type { Topic } from "@/types"
import { BarChart3, BookOpen, Edit, Plus, Settings, Trash2, Users } from "lucide-react"
import { useEffect, useState } from "react"
import { UserManagement } from "./user-management"
import { VocabularyManagement } from "./vocabulary-management"

export function TopicManagement() {
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
  const [activeTab, setActiveTab] = useState("topics")
  const [formError, setFormError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  })

  useEffect(() => {
    loadTopics()
  }, [])

  const loadTopics = async () => {
    try {
      const data = await topicsAPI.getAll()
      setTopics(data)
    } catch (error) {
      console.error("Failed to load topics:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setIsSubmitting(true)

    try {
      if (editingTopic) {
        await topicsAPI.update(editingTopic.id, formData)
      } else {
        await topicsAPI.create(formData)
      }

      await loadTopics()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Failed to save topic:", error)
      let errorMessage = "Failed to save topic"

      if (error instanceof Error) {
        // Customize error messages for better UX
        if (error.message.includes("topic with this name already exists")) {
          errorMessage = "A topic with this name already exists. Please choose a different name."
        } else if (error.message.includes("name")) {
          errorMessage = "Please check the topic name and try again."
        } else {
          errorMessage = error.message
        }
      }

      setFormError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (topic: Topic) => {
    setEditingTopic(topic)
    setFormData({
      name: topic.name,
      description: topic.description,
      color: topic.color,
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this topic? All vocabulary in this topic will also be deleted.")) {
      setDeletingId(id)
      try {
        await topicsAPI.delete(id)
        await loadTopics()
      } catch (error) {
        console.error("Failed to delete topic:", error)
      } finally {
        setDeletingId(null)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: "", description: "", color: "#3B82F6" })
    setEditingTopic(null)
    setFormError(null)
    setIsSubmitting(false)
  }

  if (selectedTopic) {
    return <VocabularyManagement
      topic={selectedTopic}
      onBack={() => setSelectedTopic(null)}
      onVocabularyUpdate={loadTopics} // Reload topics when vocabulary is updated
    />
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="topics" className="flex items-center space-x-2">
            <BookOpen className="h-4 w-4" />
            <span>Topic Management</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="topics" className="space-y-6">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic Management</h2>
                <p className="text-gray-600">Create and manage vocabulary topics for your learners</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{topics.length}</div>
                  <div className="text-sm text-gray-500">Total Topics</div>
                </div>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetForm} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Topic
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>{editingTopic ? "Edit Topic" : "Create New Topic"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">Topic Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., Animals & Wildlife"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Describe what this topic covers..."
                          rows={3}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="color">Theme Color</Label>
                        <div className="flex items-center space-x-3">
                          <Input
                            id="color"
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-16 h-10"
                          />
                          <div className="flex-1">
                            <div className="w-full h-4 rounded" style={{ backgroundColor: formData.color }} />
                          </div>
                        </div>
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
                              <span>{editingTopic ? "Updating..." : "Creating..."}</span>
                            </div>
                          ) : (
                            editingTopic ? "Update" : "Create"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card
                key={topic.id}
                className="hover:shadow-lg transition-all duration-200 group border-l-4"
                style={{ borderLeftColor: topic.color }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: topic.color }} />
                      <CardTitle className="text-lg font-semibold">{topic.name}</CardTitle>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(topic)} className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(topic.id)}
                        disabled={deletingId === topic.id}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 disabled:opacity-50"
                      >
                        {deletingId === topic.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="text-sm">{topic.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="flex items-center space-x-1">
                        <BookOpen className="h-3 w-3" />
                        <span>{topic.vocabulary_count} words</span>
                      </Badge>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Created</div>
                        <div className="text-xs font-medium text-gray-700">
                          {new Date(topic.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setSelectedTopic(topic)}
                      className="flex-1 text-sm"
                      style={{ backgroundColor: topic.color }}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Words
                    </Button>
                    <Button variant="outline" size="sm" className="px-3">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {topics.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No topics yet</h3>
                <p className="text-gray-600 mb-4">Create your first topic to start building vocabulary collections.</p>
                <Button onClick={() => setDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Topic
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>
      </Tabs>
    </div>
  )
}
