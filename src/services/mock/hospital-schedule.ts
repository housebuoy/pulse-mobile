import { format, addDays, isWeekend } from 'date-fns';

// A fake database function to simulate an API call
export const fetchMockAvailability = async (hospitalId: string, currentMonth: Date) => {
  
  // 1. Simulate a 800ms network delay so we can see our loading spinners
  await new Promise(resolve => setTimeout(resolve, 800));

  const closedDates: string[] = [];
  const fullDates: string[] = [];
  const slotsByDate: Record<string, any> = {};

  // 2. Generate 30 days of fake data for the current month
  for (let i = 0; i < 30; i++) {
    const date = addDays(currentMonth, i);
    const dateString = format(date, 'yyyy-MM-dd');

    // Rule A: Hospital is closed on Sundays
    if (date.getDay() === 0) {
      closedDates.push(dateString);
      continue;
    }

    // Rule B: Randomly make some days completely full (about 10% chance)
    if (Math.random() < 0.1) {
      fullDates.push(dateString);
      continue;
    }

    // Rule C: Generate normal time slots for open days
    slotsByDate[dateString] = {
      MORNING: [
        { time: '09:00 AM', available: Math.random() > 0.3 }, // 30% chance of being booked
        { time: '09:30 AM', available: Math.random() > 0.3 },
        { time: '10:00 AM', available: true },
        { time: '11:15 AM', available: Math.random() > 0.3 },
      ],
      AFTERNOON: [
        { time: '12:30 PM', available: true },
        { time: '02:15 PM', available: Math.random() > 0.3 },
        { time: '03:00 PM', available: false }, // Always simulate one booked afternoon slot
        { time: '04:30 PM', available: true },
      ]
    };
  }

  // 3. Return the exact shape your TanStack Query expects!
  return {
    closedDates,
    fullDates,
    slots: slotsByDate
  };
};