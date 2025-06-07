"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, Bell, Mail, AlertCircle } from "lucide-react"
import type { User as UserType } from "@/types"

interface NotificationsSettingsProps {
  user: UserType
}

export function NotificationsSettings({ user }: NotificationsSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState({
    dailyReminders: true,
    weeklyProgress: true,
    newTopics: true,
    accountUpdates: true,
    marketing: false,
  })

  const [pushNotifications, setPushNotifications] = useState({
    dailyReminders: true,
    achievements: true,
    newTopics: false,
    accountUpdates: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleEmailChange = (key: keyof typeof emailNotifications) => {
    setEmailNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handlePushChange = (key: keyof typeof pushNotifications) => {
    setPushNotifications((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSuccess(true)
    } catch (err) {
      console.error("Failed to update notification settings")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>
        <p className="text-gray-600">Manage how and when you receive notifications from Wordify</p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Notification settings updated successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Email Notifications */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-blue-600" />
              Email Notifications
            </h3>
            <p className="text-sm text-gray-600">Manage notifications sent to your email address</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-reminders" className="font-medium">
                    Daily Study Reminders
                  </Label>
                  <p className="text-sm text-gray-600">Receive daily reminders to practice vocabulary</p>
                </div>
                <Switch
                  id="email-reminders"
                  checked={emailNotifications.dailyReminders}
                  onCheckedChange={() => handleEmailChange("dailyReminders")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-progress" className="font-medium">
                    Weekly Progress Reports
                  </Label>
                  <p className="text-sm text-gray-600">Get a summary of your learning progress each week</p>
                </div>
                <Switch
                  id="email-progress"
                  checked={emailNotifications.weeklyProgress}
                  onCheckedChange={() => handleEmailChange("weeklyProgress")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-topics" className="font-medium">
                    New Topics & Content
                  </Label>
                  <p className="text-sm text-gray-600">Be notified when new vocabulary topics are added</p>
                </div>
                <Switch
                  id="email-topics"
                  checked={emailNotifications.newTopics}
                  onCheckedChange={() => handleEmailChange("newTopics")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-account" className="font-medium">
                    Account Updates
                  </Label>
                  <p className="text-sm text-gray-600">Important notifications about your account</p>
                </div>
                <Switch
                  id="email-account"
                  checked={emailNotifications.accountUpdates}
                  onCheckedChange={() => handleEmailChange("accountUpdates")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email-marketing" className="font-medium">
                    Marketing & Promotions
                  </Label>
                  <p className="text-sm text-gray-600">Receive news about features and special offers</p>
                </div>
                <Switch
                  id="email-marketing"
                  checked={emailNotifications.marketing}
                  onCheckedChange={() => handleEmailChange("marketing")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Push Notifications */}
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-600" />
              Push Notifications
            </h3>
            <p className="text-sm text-gray-600">Manage notifications shown in your browser or mobile device</p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-reminders" className="font-medium">
                    Daily Study Reminders
                  </Label>
                  <p className="text-sm text-gray-600">Receive push notifications to remind you to study</p>
                </div>
                <Switch
                  id="push-reminders"
                  checked={pushNotifications.dailyReminders}
                  onCheckedChange={() => handlePushChange("dailyReminders")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-achievements" className="font-medium">
                    Achievements & Milestones
                  </Label>
                  <p className="text-sm text-gray-600">Be notified when you earn badges or reach milestones</p>
                </div>
                <Switch
                  id="push-achievements"
                  checked={pushNotifications.achievements}
                  onCheckedChange={() => handlePushChange("achievements")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-topics" className="font-medium">
                    New Topics & Content
                  </Label>
                  <p className="text-sm text-gray-600">Be notified when new vocabulary topics are added</p>
                </div>
                <Switch
                  id="push-topics"
                  checked={pushNotifications.newTopics}
                  onCheckedChange={() => handlePushChange("newTopics")}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push-account" className="font-medium">
                    Account Updates
                  </Label>
                  <p className="text-sm text-gray-600">Important notifications about your account</p>
                </div>
                <Switch
                  id="push-account"
                  checked={pushNotifications.accountUpdates}
                  onCheckedChange={() => handlePushChange("accountUpdates")}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Browser Permissions Alert */}
        <Alert className="bg-blue-50 border-blue-200">
          <AlertCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            Push notifications require browser permissions. If you don't see notifications, please check your browser
            settings.
          </AlertDescription>
        </Alert>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Notification Settings"}
          </Button>
        </div>
      </form>
    </div>
  )
}
