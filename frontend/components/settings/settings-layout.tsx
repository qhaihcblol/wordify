"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, Shield, Key, Bell, Palette, ArrowLeft } from "lucide-react"

interface SettingsLayoutProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  userRole: string
}

export function SettingsLayout({ children, activeTab, onTabChange, userRole }: SettingsLayoutProps) {
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: <User className="h-4 w-4" />,
      roles: ["admin", "user"],
    },
    {
      id: "account",
      label: "Account & Security",
      icon: <Key className="h-4 w-4" />,
      roles: ["admin", "user"],
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: <Palette className="h-4 w-4" />,
      roles: ["admin", "user"],
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="h-4 w-4" />,
      roles: ["admin", "user"],
    },
  ]

  const filteredTabs = tabs.filter((tab) => tab.roles.includes(userRole))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600">Manage your account settings and preferences</p>
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="md:col-span-1">
          <Card className="p-2">
            <div className="space-y-1">
              {filteredTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    activeTab === tab.id ? "bg-blue-600 text-white" : "text-gray-700"
                  }`}
                  onClick={() => onTabChange(tab.id)}
                >
                  <span className="flex items-center">
                    {tab.icon}
                    <span className="ml-2">{tab.label}</span>
                  </span>
                </Button>
              ))}
            </div>
          </Card>

          {userRole === "admin" && (
            <Card className="p-4 mt-4 bg-gradient-to-r from-amber-50 to-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-2 text-amber-800">
                <Shield className="h-5 w-5" />
                <span className="font-medium">Admin Account</span>
              </div>
              <p className="text-sm text-amber-700 mt-2">
                You have administrative privileges with access to additional settings and controls.
              </p>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="md:col-span-3">
          <Card className="p-6">{children}</Card>
        </div>
      </div>
    </div>
  )
}
