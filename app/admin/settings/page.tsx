"use client"

import { useEffect, useState } from "react"
import { getHotelSettings, updateHotelSettings, getHolidays, addHoliday, deleteHoliday } from "@/lib/actions/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Trash2 } from "lucide-react"
import type { HotelSettings, Holiday } from "@/lib/types"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<HotelSettings | null>(null)
  const [holidays, setHolidays] = useState<Holiday[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [settingsData, holidaysData] = await Promise.all([
      getHotelSettings(),
      getHolidays(),
    ])
    setSettings(settingsData)
    setHolidays(holidaysData)
    setLoading(false)
  }

  const handleSettingsSubmit = async (formData: FormData) => {
    setSaving(true)
    await updateHotelSettings(formData)
    setSaving(false)
    loadData()
  }

  const handleAddHoliday = async (formData: FormData) => {
    await addHoliday(formData)
    loadData()
    // Reset form
    const form = document.getElementById("add-holiday-form") as HTMLFormElement
    if (form) form.reset()
  }

  const handleDeleteHoliday = async (id: string) => {
    if (confirm("Are you sure you want to remove this holiday?")) {
      await deleteHoliday(id)
      loadData()
    }
  }

  if (loading) {
    return <div className="container py-12">Loading...</div>
  }

  return (
    <div className="container py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage hotel timings and holidays
        </p>
      </div>

      <div className="grid gap-8">
        {/* Hotel Timings */}
        <Card>
          <CardHeader>
            <CardTitle>Hotel Timings</CardTitle>
            <CardDescription>
              Set your opening and closing times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSettingsSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
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
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_open"
                  id="is_open"
                  defaultChecked={settings?.is_open ?? true}
                  className="h-4 w-4"
                  disabled={saving}
                />
                <Label htmlFor="is_open">Hotel is currently open for orders</Label>
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader>
            <CardTitle>Holidays</CardTitle>
            <CardDescription>
              Add dates when the hotel will be closed
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Add Holiday Form */}
            <form id="add-holiday-form" action={handleAddHoliday} className="flex gap-4 mb-6">
              <div className="flex-1 space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input name="date" id="date" type="date" required />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="reason">Reason (optional)</Label>
                <Input name="reason" id="reason" placeholder="e.g., Festival" />
              </div>
              <div className="flex items-end">
                <Button type="submit">Add Holiday</Button>
              </div>
            </form>

            {/* Holidays Table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell>
                      {new Date(holiday.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{holiday.reason || "-"}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteHoliday(holiday.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {holidays.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No holidays scheduled
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
