"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { SettingsLayout } from "@/components/settings/settings-layout"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { AccountSettings } from "@/components/settings/account-settings"
import { PreferencesSettings } from "@/components/settings/preferences-settings"
import { NotificationsSettings } from "@/components/settings/notifications-settings"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("profile")

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profile":
        return <ProfileSettings user={user} />
      case "account":
        return <AccountSettings user={user} />
      case "preferences":
        return <PreferencesSettings user={user} />
      case "notifications":
        return <NotificationsSettings user={user} />
      default:
        return <ProfileSettings user={user} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab} userRole={user.role}>
        {renderActiveTab()}
      </SettingsLayout>
    </div>
  )
}
