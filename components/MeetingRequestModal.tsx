'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, Clock, User, MessageSquare } from 'lucide-react'

interface TimeSlot {
  date: string
  display: string
}

interface MeetingRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onMeetingScheduled: (meetingDetails: string) => void
  userId: string
}

export default function MeetingRequestModal({ 
  isOpen, 
  onClose, 
  onMeetingScheduled,
  userId 
}: MeetingRequestModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<string>('')
  const [summary, setSummary] = useState('')
  const [description, setDescription] = useState('')
  const [attendeeEmail, setAttendeeEmail] = useState(process.env.NEXT_PUBLIC_DEFAULT_ATTENDEE_EMAIL || 'support@aven.com')
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)

  // Load available time slots when modal opens
  useEffect(() => {
    if (isOpen) {
      loadTimeSlots()
    }
  }, [isOpen])

  const loadTimeSlots = async () => {
    setIsLoadingSlots(true)
    try {
      const response = await fetch('/api/meeting')
      if (response.ok) {
        const data = await response.json()
        setTimeSlots(data.timeSlots)
      }
    } catch (error) {
      console.error('Error loading time slots:', error)
    } finally {
      setIsLoadingSlots(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedSlot || !summary || !attendeeEmail) {
      alert('Please fill in all required fields')
      return
    }

    setIsLoading(true)
    
    try {
      const startTime = new Date(selectedSlot)
      const endTime = new Date(startTime.getTime() + 30 * 60 * 1000) // 30 minutes later

      const response = await fetch('/api/meeting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          summary,
          description,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          attendeeEmail,
          timeZone: 'America/New_York',
          userId
        })
      })

      if (response.ok) {
        const data = await response.json()
        onMeetingScheduled(data.message)
        onClose()
        
        // Reset form
        setSelectedSlot('')
        setSummary('')
        setDescription('')
        setAttendeeEmail('')
      } else {
        const error = await response.json()
        alert(`Failed to schedule meeting: ${error.error}`)
      }
    } catch (error) {
      console.error('Error scheduling meeting:', error)
      alert('Failed to schedule meeting. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Schedule Meeting
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Meeting Summary */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meeting Topic *
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="e.g., Aven Account Review"
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional meeting description..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700 resize-none"
            />
          </div>

          {/* Attendee Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Attendee Email *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                placeholder="attendee@example.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white bg-white dark:bg-gray-700"
                required
              />
            </div>
          </div>

          {/* Time Slots */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Time *
            </label>
            {isLoadingSlots ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading available times...</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {timeSlots.map((slot) => (
                  <label
                    key={slot.date}
                    className={`flex items-center p-3 border rounded-xl cursor-pointer transition-colors ${
                      selectedSlot === slot.date
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="timeSlot"
                      value={slot.date}
                      checked={selectedSlot === slot.date}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="sr-only"
                    />
                    <Clock className="w-4 h-4 text-gray-400 mr-3" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {slot.display}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !selectedSlot || !summary || !attendeeEmail}
            className="w-full px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Scheduling...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Calendar className="w-5 h-5 mr-2" />
                Schedule Meeting
              </div>
            )}
          </button>
        </form>
      </div>
    </div>
  )
} 