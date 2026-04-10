"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Loader2, Calendar, Clock, XCircle, CheckCircle } from "lucide-react"
import type { HotelSettings, Holiday } from "@/lib/types"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HotelSettings | null>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newHolidayDate, setNewHolidayDate] = useState("")
  const [newHolidayReason, setNewHolidayReason] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [settingsRes, holidaysRes] = await Promise.all([
        supabase.from("hotel_settings").select("*").eq("id", 1).single(),
        supabase.from("holidays").select("*").order("date", { ascending: true }),
      ])

      if (!settingsRes.data) {
        await supabase.from("hotel_settings").insert({
          id: 1,
          is_open: true,
          opening_time: "10:00",
          closing_time: "22:00",
        })
        setSettings({ id: 1, is_open: true, opening_time: "10:00", closing_time: "22:00" })
      } else {
        setSettings(settingsRes.data)
      }
      setHolidays(holidaysRes.data || [])
    } catch (err) {
      console.error("Error loading data:", err)
    }
    setLoading(false)
  }

  const handleSettingsSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const opening_time = formData.get("opening_time") as string
    const closing_time = formData.get("closing_time") as string

    const { error } = await supabase
      .from("hotel_settings")
      .upsert({
        id: 1,
        opening_time,
        closing_time,
        is_open: settings?.is_open ?? true,
      })

    if (error) {
      setError(error.message)
    } else {
      await loadData()
    }
    setSaving(false)
  }

  const handleAddHoliday = async () => {
    if (!newHolidayDate) return
    setSaving(true)
    setError(null)

    const { error } = await supabase.from("holidays").insert({
      date: newHolidayDate,
      reason: newHolidayReason || null,
    })

    if (error) {
      setError(error.message)
    } else {
      setNewHolidayDate("")
      setNewHolidayReason("")
      await loadData()
    }
    setSaving(false)
  }

  const handleDeleteHoliday = async (id: string) => {
    if (confirm("Are you sure you want to remove this holiday?")) {
      setSaving(true)
      const { error } = await supabase.from("holidays").delete().eq("id", id)
      if (!error) {
        await loadData()
      }
      setSaving(false)
    }
  }

  const toggleStoreStatus = async () => {
    if (!settings) return
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from("hotel_settings")
      .upsert({
        id: 1,
        is_open: !settings.is_open,
        opening_time: settings.opening_time,
        closing_time: settings.closing_time,
      })

    if (!error) {
      await loadData()
    } else {
      setError(error.message)
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage store timings and holidays</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <div className={`p-4 rounded-2xl ${settings?.is_open ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {settings?.is_open ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-semibold">{settings?.is_open ? "Store is Open" : "Store is Closed"}</p>
                <p className="text-sm text-muted-foreground">
                  {settings?.opening_time || "10:00"} - {settings?.closing_time || "22:00"}
                </p>
              </div>
            </div>
            <Button
              onClick={toggleStoreStatus}
              disabled={saving}
              variant={settings?.is_open ? "destructive" : "default"}
              className="shrink-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {settings?.is_open ? "Close Store" : "Open Store"}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Store Timings
            </CardTitle>
            <CardDescription>Set your opening and closing times</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSettingsSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="opening_time">Opening Time</Label>
                  <Input
                    name="opening_time"
                    id="opening_time"
                    type="time"
                    defaultValue={settings?.opening_time || "10:00"}
                    disabled={saving}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing_time">Closing Time</Label>
                  <Input
                    name="closing_time"
                    id="closing_time"
                    type="time"
                    defaultValue={settings?.closing_time || "22:00"}
                    disabled={saving}
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Timings
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Holidays
            </CardTitle>
            <CardDescription>Add dates when the store will be closed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="sm:flex-1"
              />
              <Input
                type="text"
                placeholder="Reason (e.g., Festival)"
                value={newHolidayReason}
                onChange={(e) => setNewHolidayReason(e.target.value)}
                className="sm:flex-1"
              />
              <Button onClick={handleAddHoliday} disabled={!newHolidayDate || saving} className="shrink-0">
                Add
              </Button>
            </div>

            <div className="space-y-2">
              {holidays.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No holidays scheduled</p>
              ) : (
                holidays.map((holiday) => (
                  <div
                    key={holiday.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(holiday.date).toLocaleDateString("en-IN", {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      {holiday.reason && (
                        <p className="text-sm text-muted-foreground">{holiday.reason}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteHoliday(holiday.id)}
                      className="text-destructive hover:text-destructive"
                      disabled={saving}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}