package java;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;

/**
 * CalendarEvent class manages scheduling and event details
 * This class handles calendar events independently without affecting other system components
 */
public class calendar_event {
    private HashMap<String, EventDetails> events;
    private ArrayList<EventLog> eventHistory;
    private static final int MAX_EVENTS_PER_DAY = 10;
    private boolean isCalendarLocked;
    
    /**
     * Inner class to store event details
     */
    private static class EventDetails {
        private String eventId;
        private String eventName;
        private String description;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private EventPriority priority;
        private EventStatus status;
        private ArrayList<String> attendees;
        private String location;
        private String organizer;
        
        public EventDetails(String eventName, String description, LocalDateTime startTime, 
                          LocalDateTime endTime, EventPriority priority, String organizer) {
            this.eventId = generateEventId();
            this.eventName = eventName;
            this.description = description;
            this.startTime = startTime;
            this.endTime = endTime;
            this.priority = priority;
            this.status = EventStatus.SCHEDULED;
            this.attendees = new ArrayList<>();
            this.location = "TBD";
            this.organizer = organizer;
        }
        
        private String generateEventId() {
            return "EVT_" + UUID.randomUUID().toString().substring(0, 8);
        }
    }
    
    /**
     * Inner class for event logging
     */
    private static class EventLog {
        private LocalDateTime timestamp;
        private String eventId;
        private String action;
        private String details;
        
        public EventLog(String eventId, String action, String details) {
            this.timestamp = LocalDateTime.now();
            this.eventId = eventId;
            this.action = action;
            this.details = details;
        }
        
        @Override
        public String toString() {
            return String.format("[%s] Event: %s - Action: %s - Details: %s",
                timestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                eventId, action, details);
        }
    }
    
    /**
     * Enum for event priority levels
     */
    public enum EventPriority {
        LOW,
        MEDIUM,
        HIGH,
        URGENT
    }
    
    /**
     * Enum for event status
     */
    private enum EventStatus {
        SCHEDULED,
        IN_PROGRESS,
        COMPLETED,
        CANCELLED,
        POSTPONED
    }
    
    /**
     * Constructor initializes calendar event management
     */
    public calendar_event() {
        this.events = new HashMap<>();
        this.eventHistory = new ArrayList<>();
        this.isCalendarLocked = false;
    }
    
    /**
     * Creates a new event
     * @return String event ID if successful, null if failed
     */
    public String createEvent(String eventName, String description, LocalDateTime startTime,
                            LocalDateTime endTime, EventPriority priority, String organizer) {
        if (isCalendarLocked) {
            logEventActivity("SYSTEM", "CREATE_FAILED", "Calendar is locked");
            return null;
        }
        
        if (!isTimeSlotAvailable(startTime, endTime)) {
            logEventActivity("SYSTEM", "CREATE_FAILED", "Time slot unavailable");
            return null;
        }
        
        EventDetails newEvent = new EventDetails(eventName, description, startTime, 
                                               endTime, priority, organizer);
        events.put(newEvent.eventId, newEvent);
        logEventActivity(newEvent.eventId, "CREATE", "Event created: " + eventName);
        return newEvent.eventId;
    }
    
    /**
     * Checks if time slot is available
     */
    private boolean isTimeSlotAvailable(LocalDateTime startTime, LocalDateTime endTime) {
        int eventsInDay = 0;
        for (EventDetails event : events.values()) {
            if (event.startTime.toLocalDate().equals(startTime.toLocalDate())) {
                eventsInDay++;
                if (eventsInDay >= MAX_EVENTS_PER_DAY) return false;
                
                // Check for time overlap
                if ((startTime.isBefore(event.endTime) && endTime.isAfter(event.startTime))) {
                    return false;
                }
            }
        }
        return true;
    }
    
    /**
     * Updates event details
     */
    public boolean updateEvent(String eventId, String newName, String newDescription, 
                             LocalDateTime newStartTime, LocalDateTime newEndTime) {
        EventDetails event = events.get(eventId);
        if (event != null) {
            event.eventName = newName != null ? newName : event.eventName;
            event.description = newDescription != null ? newDescription : event.description;
            
            if (newStartTime != null && newEndTime != null) {
                if (isTimeSlotAvailable(newStartTime, newEndTime)) {
                    event.startTime = newStartTime;
                    event.endTime = newEndTime;
                } else {
                    return false;
                }
            }
            
            logEventActivity(eventId, "UPDATE", "Event details updated");
            return true;
        }
        return false;
    }
    
    /**
     * Adds attendee to event
     */
    public boolean addAttendee(String eventId, String attendeeId) {
        EventDetails event = events.get(eventId);
        if (event != null && !event.attendees.contains(attendeeId)) {
            event.attendees.add(attendeeId);
            logEventActivity(eventId, "ADD_ATTENDEE", "Added attendee: " + attendeeId);
            return true;
        }
        return false;
    }
    
    /**
     * Updates event location
     */
    public boolean updateLocation(String eventId, String newLocation) {
        EventDetails event = events.get(eventId);
        if (event != null) {
            event.location = newLocation;
            logEventActivity(eventId, "UPDATE_LOCATION", "Location updated to: " + newLocation);
            return true;
        }
        return false;
    }
    
    /**
     * Logs event activities
     */
    private void logEventActivity(String eventId, String action, String details) {
        eventHistory.add(new EventLog(eventId, action, details));
    }
    
    /**
     * Gets event details
     */
    public String getEventDetails(String eventId) {
        EventDetails event = events.get(eventId);
        if (event == null) return "Event not found";
        
        StringBuilder details = new StringBuilder();
        details.append("Event Details:\n");
        details.append("Name: ").append(event.eventName).append("\n");
        details.append("Description: ").append(event.description).append("\n");
        details.append("Start Time: ").append(event.startTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        details.append("End Time: ").append(event.endTime.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)).append("\n");
        details.append("Priority: ").append(event.priority).append("\n");
        details.append("Status: ").append(event.status).append("\n");
        details.append("Location: ").append(event.location).append("\n");
        details.append("Organizer: ").append(event.organizer).append("\n");
        details.append("Attendees: ").append(String.join(", ", event.attendees));
        
        return details.toString();
    }
    
    /**
     * Gets event history
     */
    public ArrayList<String> getEventHistory() {
        ArrayList<String> history = new ArrayList<>();
        for (EventLog log : eventHistory) {
            history.add(log.toString());
        }
        return history;
    }
    
    /**
     * Cancels an event
     */
    public boolean cancelEvent(String eventId) {
        EventDetails event = events.get(eventId);
        if (event != null) {
            event.status = EventStatus.CANCELLED;
            logEventActivity(eventId, "CANCEL", "Event cancelled");
            return true;
        }
        return false;
    }
}
