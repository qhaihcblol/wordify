"use client"

import type React from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/contexts/auth-context"
import { authAPI } from "@/lib/api"
import type { User as UserType } from "@/types"
import { AlertCircle, CheckCircle, Upload } from "lucide-react"
import { useState } from "react"

interface ProfileSettingsProps {
  user: UserType
}

export function ProfileSettings({ user }: ProfileSettingsProps) {
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    first_name: user.name.split(' ')[0] || '',
    last_name: user.name.split(' ').slice(1).join(' ') || '',
    email: user.email,
    bio: user.bio || "I'm passionate about learning new languages and expanding my vocabulary.",
    location: user.location || "New York, USA",
    website: user.website || "https://example.com",
    language: user.language || "english",
    timezone: user.timezone || "UTC-5",
  })
  const [avatar, setAvatar] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setAvatar(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSuccess(false)
    setError("")

    try {
      // Call real API to update profile
      const updatedUser = await authAPI.updateProfile(formData)

      // Update user context immediately
      setUser(updatedUser)

      // Update localStorage user data
      localStorage.setItem("user-data", JSON.stringify(updatedUser))

      setSuccess(true)
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError(err.message || "Failed to update profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
        <p className="text-gray-600">Update your personal information and public profile</p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-700">Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Avatar Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <Avatar className="h-24 w-24 border-2 border-gray-200">
            <AvatarImage src={avatar || "/placeholder.svg?height=96&width=96"} />
            <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-2">
            <h3 className="font-medium text-gray-900">Profile Picture</h3>
            <p className="text-sm text-gray-600">
              Upload a clear photo to help others recognize you. PNG or JPG up to 2MB.
            </p>
            <div className="flex items-center space-x-4">
              <label htmlFor="avatar-upload">
                <div className="flex items-center space-x-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-md cursor-pointer hover:bg-blue-100 transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload new image</span>
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </label>
              {avatar && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAvatar(null)}
                  className="text-red-600 hover:text-red-700"
                >
                  Remove
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input
                id="first_name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Your first name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input
                id="last_name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Your last name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                placeholder="Your email address"
                disabled
                className="bg-gray-50 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500">Email address cannot be changed</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us a little about yourself"
              rows={4}
            />
            <p className="text-xs text-gray-500">Brief description for your profile. Maximum 200 characters.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Your location"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="Your website URL"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Preferences */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Regional Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="japanese">Japanese</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(value) => handleSelectChange("timezone", value)}>
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC-12">UTC-12:00</SelectItem>
                  <SelectItem value="UTC-11">UTC-11:00</SelectItem>
                  <SelectItem value="UTC-10">UTC-10:00</SelectItem>
                  <SelectItem value="UTC-9">UTC-09:00</SelectItem>
                  <SelectItem value="UTC-8">UTC-08:00</SelectItem>
                  <SelectItem value="UTC-7">UTC-07:00</SelectItem>
                  <SelectItem value="UTC-6">UTC-06:00</SelectItem>
                  <SelectItem value="UTC-5">UTC-05:00</SelectItem>
                  <SelectItem value="UTC-4">UTC-04:00</SelectItem>
                  <SelectItem value="UTC-3">UTC-03:00</SelectItem>
                  <SelectItem value="UTC-2">UTC-02:00</SelectItem>
                  <SelectItem value="UTC-1">UTC-01:00</SelectItem>
                  <SelectItem value="UTC+0">UTC+00:00</SelectItem>
                  <SelectItem value="UTC+1">UTC+01:00</SelectItem>
                  <SelectItem value="UTC+2">UTC+02:00</SelectItem>
                  <SelectItem value="UTC+3">UTC+03:00</SelectItem>
                  <SelectItem value="UTC+4">UTC+04:00</SelectItem>
                  <SelectItem value="UTC+5">UTC+05:00</SelectItem>
                  <SelectItem value="UTC+6">UTC+06:00</SelectItem>
                  <SelectItem value="UTC+7">UTC+07:00</SelectItem>
                  <SelectItem value="UTC+8">UTC+08:00</SelectItem>
                  <SelectItem value="UTC+9">UTC+09:00</SelectItem>
                  <SelectItem value="UTC+10">UTC+10:00</SelectItem>
                  <SelectItem value="UTC+11">UTC+11:00</SelectItem>
                  <SelectItem value="UTC+12">UTC+12:00</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}
