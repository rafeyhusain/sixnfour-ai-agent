import { CalendarEvent } from '@/components/wingui/wing-calendar/calendar/calendar-types'
import { addDays, startOfMonth } from 'date-fns'
import { colorOptions } from '@/components/wingui/wing-calendar/calendar/calendar-tailwind-classes'

const EVENT_TITLES = [
  'New Year’s Day Marketing Strategy',
  'Majority Rule Day Campaign Planning',
  'Valentine’s Day Dinner Promotion',
  'Good Friday Seafood Specials',
  'Easter Monday Cookout Event',
  'Labour Day Brunch Promotion',
  'Christmas Day Menu Planning',
  'Monthly Wine Tasting Event'
]

// Extract color values from colorOptions
const EVENT_COLORS = colorOptions.map((color) => color.value)

const FIXED_DATE = new Date()

export function generateMockEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const startDate = startOfMonth(FIXED_DATE)

  // Generate events for 3 months
  for (let i = 0; i < 120; i++) {
    // Fixed date progression
    const eventDate = addDays(startDate, i % 90) // Cycle through 90 days
    
    // Fixed time slots (every 2 hours starting from 8 AM)
    const hours = ((i % 12) * 2) + 8
    const startTime = new Date(eventDate.setHours(hours, 0, 0, 0))
    const endTime = new Date(startTime.getTime() + 120 * 60000) // 2 hours duration

    events.push({
      id: `event-${i + 1}`,
      title: EVENT_TITLES[i % EVENT_TITLES.length],
      color: EVENT_COLORS[i % EVENT_COLORS.length - 3],
      start: startTime,
      end: endTime,
    })
  }

  // Sort events by start date
  return events.sort((a, b) => a.start.getTime() - b.start.getTime())
}
