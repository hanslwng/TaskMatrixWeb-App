package java;

import java.util.HashMap;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.util.Random;


/**
 * UserConnection class manages individual user connection sessions and their properties
 * This class works in conjunction with connection_data but focuses on user-specific aspects
 */
public class user_connection {
    // Private fields for user connection management
    private String userId;
    private String username;
    private connection_data connectionData;
    private HashMap<String, SessionData> userSessions;
    private ArrayList<String> connectionLogs;
    private UserConnectionState connectionState;
    private static final int SESSION_TIMEOUT_MINUTES = 30;
    private int failedLoginAttempts;
    private boolean isBlocked;
    
    /**
     * Enum to represent different user connection states
     */
    public enum UserConnectionState {
        OFFLINE,
        CONNECTING,
        ONLINE,
        IDLE,
        DISCONNECTING,
        BLOCKED
    }
    
    /**
     * Inner class to store session-specific data
     */
    private class SessionData {
        private String sessionId;
        
        private LocalDateTime lastActivityTime;
        
        
        private boolean isActive;
        
        public SessionData(String ipAddress, String deviceInfo) {
            this.sessionId = generateSessionId();
            
            this.lastActivityTime = LocalDateTime.now();
            
            
            this.isActive = true;
        }
        
        private String generateSessionId() {
            return "SESSION_" + System.currentTimeMillis() + "_" + new Random().nextInt(1000);
        }
        
        public boolean isSessionExpired() {
            return LocalDateTime.now().isAfter(lastActivityTime.plusMinutes(SESSION_TIMEOUT_MINUTES));
        }
        
        public void updateActivity() {
            this.lastActivityTime = LocalDateTime.now();
        }
    }
    
    /**
     * Constructor initializes a new user connection instance
     * @param userId Unique identifier for the user
     * @param username Name of the user
     */
    public user_connection(String userId, String username) {
        this.userId = userId;
        this.username = username;
        this.connectionData = new connection_data();
        this.userSessions = new HashMap<>();
        this.connectionLogs = new ArrayList<>();
        this.connectionState = UserConnectionState.OFFLINE;
        this.failedLoginAttempts = 0;
        this.isBlocked = false;
    }
    
    /**
     * Attempts to establish a user connection
     * @param ipAddress User's IP address
     * @param deviceInfo User's device information
     * @return boolean indicating if connection was successful
     */
    public boolean connectUser(String ipAddress, String deviceInfo) {
        if (isBlocked) {
            logUserActivity("Connection blocked due to security policy");
            return false;
        }
        
        this.connectionState = UserConnectionState.CONNECTING;
        logUserActivity("Attempting connection from IP: " + ipAddress);
        
        boolean connectionSuccess = connectionData.attemptConnection(ipAddress);
        
        if (connectionSuccess) {
            SessionData newSession = new SessionData(ipAddress, deviceInfo);
            userSessions.put(newSession.sessionId, newSession);
            this.connectionState = UserConnectionState.ONLINE;
            logUserActivity("Connection established successfully");
        } else {
            handleFailedConnection();
        }
        
        return connectionSuccess;
    }
    
    /**
     * Handles failed connection attempts and security measures
     */
    private void handleFailedConnection() {
        failedLoginAttempts++;
        this.connectionState = UserConnectionState.OFFLINE;
        
        if (failedLoginAttempts >= 5) {
            isBlocked = true;
            this.connectionState = UserConnectionState.BLOCKED;
            logUserActivity("Account blocked due to multiple failed attempts");
        }
    }
    
    /**
     * Updates user session activity
     * @param sessionId ID of the session to update
     */
    public void updateSessionActivity(String sessionId) {
        SessionData session = userSessions.get(sessionId);
        if (session != null && !session.isSessionExpired()) {
            session.updateActivity();
            logUserActivity("Session activity updated: " + sessionId);
        }
    }
    
    /**
     * Checks and removes expired sessions
     */
    public void cleanExpiredSessions() {
        ArrayList<String> expiredSessions = new ArrayList<>();
        
        for (HashMap.Entry<String, SessionData> entry : userSessions.entrySet()) {
            if (entry.getValue().isSessionExpired()) {
                expiredSessions.add(entry.getKey());
                logUserActivity("Session expired: " + entry.getKey());
            }
        }
        
        expiredSessions.forEach(sessionId -> userSessions.remove(sessionId));
    }
    
    /**
     * Logs user connection activities
     * @param activity Description of the activity
     */
    private void logUserActivity(String activity) {
        String logEntry = String.format("[%s] User: %s - %s", 
            LocalDateTime.now().toString(), username, activity);
        connectionLogs.add(logEntry);
    }
    
    /**
     * Gets user connection status information
     * @return String containing user connection details
     */
    public String getUserConnectionInfo() {
        StringBuilder info = new StringBuilder();
        info.append("User Connection Information:\n");
        info.append("User ID: ").append(userId).append("\n");
        info.append("Username: ").append(username).append("\n");
        info.append("Connection State: ").append(connectionState).append("\n");
        info.append("Active Sessions: ").append(userSessions.size()).append("\n");
        info.append("Failed Login Attempts: ").append(failedLoginAttempts).append("\n");
        info.append("Is Blocked: ").append(isBlocked).append("\n");
        
        return info.toString();
    }
    
    /**
     * Disconnects a specific user session
     * @param sessionId ID of the session to disconnect
     * @return boolean indicating if disconnection was successful
     */
    public boolean disconnectSession(String sessionId) {
        SessionData session = userSessions.get(sessionId);
        if (session != null && session.isActive) {
            session.isActive = false;
            userSessions.remove(sessionId);
            logUserActivity("Session disconnected: " + sessionId);
            
            if (userSessions.isEmpty()) {
                this.connectionState = UserConnectionState.OFFLINE;
            }
            return true;
        }
        return false;
    }
    
    /**
     * Resets the blocked status and failed login attempts
     */
    public void resetSecurityStatus() {
        this.isBlocked = false;
        this.failedLoginAttempts = 0;
        this.connectionState = UserConnectionState.OFFLINE;
        logUserActivity("Security status reset");
    }
    
    /**
     * Gets the current connection state
     * @return UserConnectionState current state
     */
    public UserConnectionState getConnectionState() {
        return this.connectionState;
    }
    
    /**
     * Gets the connection logs
     * @return ArrayList<String> containing connection logs
     */
    public ArrayList<String> getConnectionLogs() {
        return new ArrayList<>(connectionLogs);
    }
    
    /**
     * Gets the number of active sessions
     * @return int number of active sessions
     */
    public int getActiveSessionCount() {
        int count = 0;
        for (SessionData session : userSessions.values()) {
            if (!session.isSessionExpired()) {
                count++;
            }
        }
        return count;
    }
}
