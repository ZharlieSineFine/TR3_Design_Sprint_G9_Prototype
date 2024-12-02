<template>
  <v-card class="calendar-card">
    <v-card-title class="d-flex align-center">
      <v-btn icon="mdi-chevron-left" @click="prevMonth" />
      <v-spacer />
      <span>{{ currentMonthText }}</span>
      <v-menu>
        <template v-slot:activator="{ props }">
          <v-btn
            variant="text"
            v-bind="props"
            class="ml-2"
          >
            {{ viewMode === 'month' ? 'Month' : 'Year' }}
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="mode in viewModes"
            :key="mode.value"
            :title="mode.text"
            @click="viewMode = mode.value"
          />
        </v-list>
      </v-menu>
      <v-spacer />
      <v-btn icon="mdi-chevron-right" @click="nextMonth" />
    </v-card-title>

    <!-- Month View -->
    <template v-if="viewMode === 'month'">
      <!-- Weekday Header -->
      <div class="calendar-header d-flex">
        <div
          v-for="day in weekDays"
          :key="day"
          class="week-day"
        >
          {{ day }}
        </div>
      </div>

      <!-- Date Grid -->
      <div class="calendar-grid">
        <div
          v-for="(day, index) in calendarDays"
          :key="index"
          class="calendar-day"
          :class="{
            'current-month': day.currentMonth,
            'today': day.isToday,
            'other-month': !day.currentMonth
          }"
        >
          <div class="day-header">
            {{ day.date.getDate() }}
          </div>
          <div v-if="day.currentMonth" class="day-content">
            <template v-if="day.courses && day.courses.length">
              <div
                v-for="course in day.courses"
                :key="course.id"
                class="course-item"
                :style="{ backgroundColor: getCourseColor(course.id) }"
              >
                <div class="course-time">
                  {{ course.timeSlotName }}
                  ({{ course.startTime }}-{{ course.endTime }})
                </div>
                <div class="course-name">{{ course.name }}</div>
                <div class="course-location">{{ course.location }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </template>

    <!-- Year View -->
    <template v-else>
      <v-row>
        <v-col
          v-for="month in 12"
          :key="month"
          cols="12"
          sm="4"
          md="3"
        >
          <v-card
            flat
            class="month-card"
            :class="{ 'current-month': month === currentDate.getMonth() + 1 }"
            @click="selectMonth(month - 1)"
          >
            <v-card-title>{{ month }} Month</v-card-title>
            <v-card-text>
              <!-- Simplified Month Preview -->
              <div class="month-preview">
                {{ getMonthSummary(month - 1) }}
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-card>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { formatTime } from '@/utils/date'

// State
const currentDate = ref(new Date())
const viewMode = ref('month')

// Options
const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const viewModes = [
  { text: 'Month View', value: 'month' },
  { text: 'Year View', value: 'year' }
]

// Course Color Mapping
const courseColors = new Map()
const colors = [
  'var(--v-theme-primary)',   // Use Theme Color
  '#FF7F50',  // Coral
  '#4CAF50',  // Green
  '#2196F3',  // Blue
  '#9C27B0',  // Purple
  '#FF9800',  // Orange
  '#795548',  // Brown
  '#607D8B'   // Blue Gray
]
let colorIndex = 0

// Get Course Color
const getCourseColor = (courseId) => {
  if (!courseColors.has(courseId)) {
    courseColors.set(courseId, colors[colorIndex % colors.length])
    colorIndex++
  }
  return courseColors.get(courseId)
}

// Computed Properties
const currentMonthText = computed(() => {
  return `${currentDate.value.getFullYear()} Year ${currentDate.value.getMonth() + 1} Month`
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const today = new Date()
  
  // Get the first day of the current month
  const firstDay = new Date(year, month, 1)
  // Get the last day of the current month
  const lastDay = new Date(year, month + 1, 0)
  
  const days = []
  
  // Add the days of the previous month (only add necessary days)
  const firstDayOfWeek = firstDay.getDay()
  if (firstDayOfWeek > 0) {
    const prevMonthDays = new Date(year, month, 0).getDate()
    for (let i = firstDayOfWeek; i > 0; i--) {
      const date = new Date(year, month - 1, prevMonthDays - i + 1)
      days.push({
        date,
        currentMonth: false,
        isToday: false,
        courses: [] // Do not display courses for non-current month
      })
    }
  }
  
  // Add the days of the current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const date = new Date(year, month, i)
    days.push({
      date,
      currentMonth: true,
      isToday: isSameDay(date, today),
      courses: getDayCourses(date)
    })
  }
  
  // Add the days of the next month (only add until the end of the current week)
  const remainingDays = 7 - (days.length % 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        currentMonth: false,
        isToday: false,
        courses: [] // Do not display courses for non-current month
      })
    }
  }
  
  return days
})

// Methods
const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const selectMonth = (month) => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    month,
    1
  )
  viewMode.value = 'month'
}

const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}

// Course Time Slot Definition
const timeSlots = [
  { id: 1, start: '08:00', end: '09:40', name: 'First Slot' },
  { id: 2, start: '10:00', end: '11:40', name: 'Second Slot' },
  { id: 3, start: '14:00', end: '15:40', name: 'Third Slot' },
  { id: 4, start: '16:00', end: '17:40', name: 'Fourth Slot' }
]

// Calculate the current week number
const getWeekNumber = (date) => {
  const termStart = new Date('2024-11-26') // Assume the current semester starts on February 26
  const diff = date.getTime() - termStart.getTime()
  const weekNumber = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1
  return weekNumber > 0 ? weekNumber : 0
}

// Simulate getting course data for a specific day
const getDayCourses = (date) => {
  // This should be fetched from the backend, now using mock data
  const courses = [
    {
      id: 1,
      name: 'Advanced Mathematics',
      timeSlot: 1,
      location: 'Teaching Building A101',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 1 // Monday
    },
    {
      id: 2,
      name: 'College English',
      timeSlot: 2,
      location: 'Teaching Building B203',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 1 // Monday
    },
    {
      id: 3,
      name: 'Computer Basics',
      timeSlot: 3,
      location: 'Experiment Building C305',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 1 // Monday
    },
    {
      id: 4,
      name: 'Physics Experiment',
      timeSlot: 4,
      location: 'Experiment Building B201',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 2 // Tuesday
    },
    {
      id: 5,
      name: 'Linear Algebra',
      timeSlot: 1,
      location: 'Teaching Building A203',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 3 // Wednesday
    },
    {
      id: 6,
      name: 'Program Design',
      timeSlot: 2,
      location: 'Experiment Building C102',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 3 // Wednesday
    },
    {
      id: 7,
      name: 'College Physics',
      timeSlot: 3,
      location: 'Teaching Building B302',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 4 // Thursday
    },
    {
      id: 8,
      name: 'Ideological and Political Theory',
      timeSlot: 4,
      location: 'Teaching Building A401',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 4 // Thursday
    },
    {
      id: 9,
      name: 'Physical Education',
      timeSlot: 1,
      location: 'Gymnasium',
      weeks: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
      weekday: 5 // Friday
    }
  ]
  
  const weekNumber = getWeekNumber(date)
  const weekday = date.getDay()

  const dayCourses = courses.filter(course => 
    course.weekday === weekday && // Match the day of the week
    course.weeks.includes(weekNumber) // Match the week number
  ).map(course => {
    const timeSlot = timeSlots[course.timeSlot - 1]
    return {
      ...course,
      startTime: timeSlot.start,
      endTime: timeSlot.end,
      timeSlotName: timeSlot.name
    }
  })

  return dayCourses
}

// Get Month Course Summary
const getMonthSummary = (month) => {
  const year = currentDate.value.getFullYear()
  const date = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  let courseCount = 0
  
  for (let i = 1; i <= lastDay.getDate(); i++) {
    date.setDate(i)
    courseCount += getDayCourses(date).length
  }
  
  return `Total ${courseCount} Courses`
}

// Add some debug information
watch(currentDate, (newDate) => {
  console.log('Current date changed:', newDate.toISOString())
  const weekNumber = getWeekNumber(newDate)
  console.log('Current week number:', weekNumber)
})
</script>

<style scoped>
.calendar-card {
  min-height: 600px;
  border: none;
  box-shadow: none;
}

.calendar-header {
  background-color: #f5f5f5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.week-day {
  flex: 1;
  padding: 12px 8px;
  text-align: center;
  font-weight: bold;
  color: rgba(0, 0, 0, 0.87);
  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.week-day:last-child {
  border-right: none;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(150px, auto);
}

.calendar-day {
  border-right: 1px solid rgba(0, 0, 0, 0.12);
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  padding: 4px;
  min-width: 150px;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.day-header {
  text-align: right;
  padding: 4px;
  color: rgba(0, 0, 0, 0.6);
  font-size: 14px;
}

.current-month .day-header {
  color: rgba(0, 0, 0, 0.87);
}

.other-month {
  background-color: #fafafa;
}

.other-month .day-header {
  color: rgba(0, 0, 0, 0.38);
  font-size: 12px;
}

.today {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.today .day-header {
  color: var(--v-theme-primary);
  font-weight: bold;
}

.day-content {
  margin-top: 4px;
}

.course-item {
  margin-bottom: 4px;
  padding: 6px 8px;
  border-radius: 4px;
  font-size: 12px;
  color: white;
  line-height: 1.2;
  background-color: var(--v-theme-primary);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.course-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
}

.course-time {
  font-weight: 500;
  margin-bottom: 3px;
  font-size: 11px;
  opacity: 0.95;
}

.course-name {
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 3px;
}

.course-location {
  font-size: 11px;
  opacity: 0.95;
}

.month-card {
  cursor: pointer;
  transition: background-color 0.2s;
}

.month-card:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

.month-card.current-month {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.month-preview {
  text-align: center;
  color: rgba(0, 0, 0, 0.6);
}

.calendar-day.current-month {
  min-height: 150px;
}

.calendar-day.other-month {
  min-height: 40px;
}
</style> 