"use client"

import { useState } from "react"
import { User, Bell, Shield, X, Plus, Trash2 } from "lucide-react"
import { CustomButton1 } from "@/components/ui/CustomButton1"
import { CustomButton2 } from "@/components/ui/CustomButton2"
import { AppNav } from "@/components/ui/AppNav"
import { PageMain } from "@/components/ui/PageMain"
import { CustomInput } from "@/components/ui/CustomInput"
import { CustomCard, CustomCardHeader, CustomCardTitle, CustomCardContent, CustomCardFooter } from "@/components/ui/CustomCard"
import { Reveal } from "@/components/ui/Reveal"

const trustedContacts = [
  { name: "Dr. Smith", relation: "Primary physician" },
  { name: "Sarah Johnson", relation: "Neighbor" },
]

export default function SettingsPage() {
  const [emergencyAlerts, setEmergencyAlerts] = useState(true)
  const [checkInReminders, setCheckInReminders] = useState(true)

  return (
    <div className="min-h-screen">
      <AppNav />

      <PageMain>
        <Reveal>
          <h1 className="mb-6 text-2xl font-medium">Settings</h1>
        </Reveal>

        <div className="flex flex-col gap-6">
          {/* Profile */}
          <Reveal delay={0.05}>
            <CustomCard>
              <CustomCardHeader>
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <CustomCardTitle>Profile</CustomCardTitle>
                </div>
              </CustomCardHeader>
              <CustomCardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-normal" htmlFor="settings-username">Username</label>
                  <CustomInput id="settings-username" defaultValue="janedoe" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-normal" htmlFor="settings-email">Email</label>
                  <CustomInput id="settings-email" type="email" defaultValue="jane@example.com" />
                </div>
              </CustomCardContent>
              <CustomCardFooter>
                <CustomButton1>Save changes</CustomButton1>
              </CustomCardFooter>
            </CustomCard>
          </Reveal>

          {/* Notifications */}
          <Reveal delay={0.1}>
            <CustomCard>
              <CustomCardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                  <CustomCardTitle>Notifications</CustomCardTitle>
                </div>
              </CustomCardHeader>
              <CustomCardContent className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-normal">Emergency alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified for urgent issues</p>
                  </div>
                  <button
                    onClick={() => setEmergencyAlerts(!emergencyAlerts)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${emergencyAlerts ? "bg-emerald-600" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${emergencyAlerts ? "translate-x-5" : ""}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-normal">Check-in reminders</p>
                    <p className="text-sm text-muted-foreground">Daily reminder to check in</p>
                  </div>
                  <button
                    onClick={() => setCheckInReminders(!checkInReminders)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${checkInReminders ? "bg-emerald-600" : "bg-muted"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checkInReminders ? "translate-x-5" : ""}`} />
                  </button>
                </div>
              </CustomCardContent>
            </CustomCard>
          </Reveal>

          {/* Trusted contacts */}
          <Reveal delay={0.15}>
            <CustomCard>
              <CustomCardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <CustomCardTitle>Trusted contacts</CustomCardTitle>
                </div>
              </CustomCardHeader>
              <CustomCardContent className="flex flex-col gap-3">
                {trustedContacts.map((contact) => (
                  <div key={contact.name} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <div>
                      <p className="text-sm font-normal">{contact.name}</p>
                      <p className="text-sm text-muted-foreground">{contact.relation}</p>
                    </div>
                    <CustomButton2 className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                    </CustomButton2>
                  </div>
                ))}
              </CustomCardContent>
              <CustomCardFooter>
                <CustomButton2>
                  <Plus className="h-4 w-4" />
                  Add trusted contact
                </CustomButton2>
              </CustomCardFooter>
            </CustomCard>
          </Reveal>

          {/* Danger zone */}
          <Reveal delay={0.2}>
            <CustomCard className="border-red-500/30">
              <CustomCardHeader>
                <CustomCardTitle className="text-red-500">Danger zone</CustomCardTitle>
              </CustomCardHeader>
              <CustomCardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Permanently delete your account and all associated data.
                </p>
                <CustomButton1 className="bg-red-600 hover:bg-red-700">
                  <Trash2 className="h-4 w-4" />
                  Delete account
                </CustomButton1>
              </CustomCardContent>
            </CustomCard>
          </Reveal>
        </div>
      </PageMain>
    </div>
  )
}
