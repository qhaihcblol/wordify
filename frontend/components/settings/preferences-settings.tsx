"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Moon, Sun, Laptop, Palette, BookOpen, Clock } from "lucide-react"
import type { User as UserType } from "@/types"

interface PreferencesSettingsProps {
  user: UserType
}

export function PreferencesSettings({ user }: PreferencesSettingsProps) {
  const [theme, setTheme] = useState("system")
  const [cardsPerSession, setCardsPerSession] = useState(10)
  const [autoPlayPronunciation, setAutoPlayPronunciation] = useState(true)
  const [showDefinitionFirst, setShowDefinitionFirst] = useState(false)
  const [enableAnimations, setEnableAnimations] = useState(true)
  const [studyReminders, setStudyReminders] = useState(true)
  const [reminderTime, setReminderTime] = useState("18:00")
  const [difficultyLevel, setDifficultyLevel] = useState("medium")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      console.error("Failed to update preferences")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Learning Preferences</h2>
        <p className="text-gray-600">Customize your learning experience and application settings</p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Preferences updated successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Appearance */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-blue-600" />
              Appearance
            </h3>
            <p className="text-sm text-gray-600">Customize how Wordify looks for you</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label>Theme</Label>
                  <RadioGroup value={theme} onValueChange={setTheme} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="light" id="light" />
                      <Label htmlFor="light" className="flex items-center cursor-pointer">
                        <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                        Light
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="dark" id="dark" />
                      <Label htmlFor="dark" className="flex items-center cursor-pointer">
                        <Moon className="h-4 w-4 mr-2 text-indigo-500" />
                        Dark
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="system" id="system" />
                      <Label htmlFor="system" className="flex items-center cursor-pointer">
                        <Laptop className="h-4 w-4 mr-2 text-gray-500" />
                        System
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="animations">Enable Animations</Label>
                    <p className="text-sm text-gray-600">Show animations during card flips and transitions</p>
                  </div>
                  <Switch id="animations" checked={enableAnimations} onCheckedChange={setEnableAnimations} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Learning Settings */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-blue-600" />
              Learning Settings
            </h3>
            <p className="text-sm text-gray-600">Customize your vocabulary learning experience</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label>Cards per Learning Session</Label>
                <div className="flex items-center space-x-4">
                  <Slider
                    value={[cardsPerSession]}
                    min={5}
                    max={30}
                    step={5}
                    onValueChange={(value) => setCardsPerSession(value[0])}
                    className="flex-1"
                  />
                  <span className="w-12 text-center font-medium">{cardsPerSession}</span>
                </div>
                <p className="text-sm text-gray-600">Number of flashcards to show in each learning session</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="pronunciation">Auto-Play Pronunciation</Label>
                  <p className="text-sm text-gray-600">Automatically play word pronunciation when card is shown</p>
                </div>
                <Switch id="pronunciation" checked={autoPlayPronunciation} onCheckedChange={setAutoPlayPronunciation} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="definition">Show Definition First</Label>
                  <p className="text-sm text-gray-600">Show word definition before the word itself</p>
                </div>
                <Switch id="definition" checked={showDefinitionFirst} onCheckedChange={setShowDefinitionFirst} />
              </div>

              <div className="space-y-3">
                <Label htmlFor="difficulty">Default Difficulty Level</Label>
                <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Easy - Focus on basic vocabulary</SelectItem>
                    <SelectItem value="medium">Medium - Balanced difficulty</SelectItem>
                    <SelectItem value="hard">Hard - Challenge with advanced words</SelectItem>
                    <SelectItem value="mixed">Mixed - Include all difficulty levels</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Reminders */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-blue-600" />
              Study Reminders
            </h3>
            <p className="text-sm text-gray-600">Set up reminders to maintain your learning streak</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminders">Enable Daily Reminders</Label>
                  <p className="text-sm text-gray-600">Receive notifications to remind you to study</p>
                </div>
                <Switch id="reminders" checked={studyReminders} onCheckedChange={setStudyReminders} />
              </div>

              {studyReminders && (
                <div className="space-y-3">
                  <Label htmlFor="reminderTime">Reminder Time</Label>
                  <input
                    id="reminderTime"
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-600">Time of day to receive study reminders</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </form>
    </div>
  )
}
