"use client"

import { useState, useEffect } from 'react'
import Calendar from '@/components/wingui/wing-calendar/calendar/calendar'
import { CalendarEvent, Mode } from '@/components/wingui/wing-calendar/calendar/calendar-types'
import { DashboardService } from '@/sdk/services/dashboard-service'
import { SpinnerStrip } from '@/components/wingui/spinner-strip/spinner-strip'

export default function CampaignCalendar() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [mode, setMode] = useState<Mode>('month')
  const [date, setDate] = useState<Date>(new Date())
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const data = await DashboardService.getEvents(date)
        setEvents(data)
      } catch (e) {
        console.log(e)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading) return <SpinnerStrip show={true} size="medium" text="Loading events..." />

  return (
    <Calendar
      events={events}
      setEvents={setEvents}
      mode={mode}
      setMode={setMode}
      date={date}
      setDate={setDate}
    />
  )
}