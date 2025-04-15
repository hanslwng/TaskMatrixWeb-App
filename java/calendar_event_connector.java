package java;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;

/**
 * CalendarEventConnector class handles connections between calendar events and other system components
 * Acts as a bridge without modifying existing code
 */
public class calendar_event_connector {
    private static calendar_event_connector instance;
    private calendar_event calendarManager;
    private HashMap<String, ArrayList<String>> userEventConnections;
    private HashMap<String, String> eventTaskConnections;
    
    private calendar_event_connector() {
        this.calendarManager = new calendar_event();
        this.userEventConnections = new HashMap<>();
        this.eventTaskConnections = new HashMap<>();
    }
    
    public static calendar_event_connector getInstance() {
        if (instance == null) {
            instance = new calendar_event_connector();
        }
        return instance;
    }
    
    /**
     * Links an event to a user
     */
    public void linkEventToUser(String eventId, String userId) {
       
    }
    
    /**
     * Links an event to a task
     */
    public void linkEventToTask(String eventId, String taskId) {
        eventTaskConnections.put(eventId, taskId);
    }
    
    /**
     * Creates an event and links it to a user
     */
    public String createEventForUser(String eventName, String description, 
                                   LocalDateTime startTime, LocalDateTime endTime, 
                                   String priority, String userId) {
        String eventId = calendarManager.createEvent(eventName, description, startTime, 
                                                   endTime, getEventPriority(priority), userId);
        if (eventId != null) {
            linkEventToUser(eventId, userId);
        }
        return eventId;
    }
    
    /**
     * Gets all events for a specific user
     */
    public ArrayList<String> getUserEvents(String userId) {
        return userEventConnections.getOrDefault(userId, new ArrayList<>());
    }
    
    /**
     * Gets associated task for an event
     */
    public String getEventTask(String eventId) {
        return eventTaskConnections.get(eventId);
    }
    
    /**
     * Converts string priority to EventPriority enum
     */
    private calendar_event.EventPriority getEventPriority(String priority) {
        try {
            return calendar_event.EventPriority.valueOf(priority.toUpperCase());
        } catch (IllegalArgumentException e) {
            return calendar_event.EventPriority.MEDIUM; // Default priority
        }
    }
    
    /**
     * Gets event details through calendar manager
     */
    public String getEventDetails(String eventId) {
        return calendarManager.getEventDetails(eventId);
    }
    
    /**
     * Updates event details through calendar manager
     */
    public boolean updateEvent(String eventId, String newName, String newDescription,
                             LocalDateTime newStartTime, LocalDateTime newEndTime) {
        return calendarManager.updateEvent(eventId, newName, newDescription, 
                                         newStartTime, newEndTime);
    }
    
    /**
     * Adds attendee to event through calendar manager
     */
    public boolean addEventAttendee(String eventId, String attendeeId) {
        boolean added = calendarManager.addAttendee(eventId, attendeeId);
        if (added) {
            linkEventToUser(eventId, attendeeId);
        }
        return added;
    }
    
    /**
     * Cancels event and cleans up connections
     */
    public boolean cancelEvent(String eventId) {
        boolean cancelled = calendarManager.cancelEvent(eventId);
        if (cancelled) {
            eventTaskConnections.remove(eventId);
            // Remove event from user connections
            for (ArrayList<String> userEvents : userEventConnections.values()) {
                userEvents.remove(eventId);
            }
        }
        return cancelled;
    }
    
    /**
     * Gets event history through calendar manager
     */
    public ArrayList<String> getEventHistory() {
        return calendarManager.getEventHistory();
    }
} 