package java;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;
import java.time.LocalDateTime;

/**
 * ConnectionData class handles connection-related information and statistics
 * This class is designed to monitor and store connection details without affecting the main system
 */
public class connection_data {
    // Private fields for connection information
    private String connectionId;
    private LocalDateTime connectionTime;
    private String connectionStatus;
    private int retryCount;
    private HashMap<String, Integer> connectionAttempts;
    private ArrayList<ConnectionLog> connectionHistory;
    private static final int MAX_RETRY_ATTEMPTS = 3;
    private double connectionSpeed;
    private boolean isSecure;
    
    /**
     * Inner class to store connection log entries
     */
    private class ConnectionLog {
        private LocalDateTime timestamp;
        private String action;
        private String result;
        
        public ConnectionLog(String action, String result) {
            this.timestamp = LocalDateTime.now();
            this.action = action;
            this.result = result;
        }
        
        @Override
        public String toString() {
            return String.format("[%s] Action: %s, Result: %s", 
                timestamp.toString(), action, result);
        }
    }
    
    /**
     * Constructor initializes a new connection data instance
     */
    public connection_data() {
        this.connectionId = generateConnectionId();
        this.connectionTime = LocalDateTime.now();
        this.connectionStatus = "INITIALIZED";
        this.retryCount = 0;
        this.connectionAttempts = new HashMap<>();
        this.connectionHistory = new ArrayList<>();
        this.connectionSpeed = 0.0;
        this.isSecure = false;
    }
    
    /**
     * Generates a unique connection ID
     * @return String unique connection identifier
     */
    private String generateConnectionId() {
        return UUID.randomUUID().toString();
    }
    
    /**
     * Simulates a connection attempt and logs the result
     * @param targetAddress The address to connect to
     * @return boolean indicating if the connection was successful
     */
    public boolean attemptConnection(String targetAddress) {
        // Simulate connection logic
        boolean isSuccessful = Math.random() > 0.3; // 70% success rate
        
        // Update connection attempts counter
        connectionAttempts.put(targetAddress, 
            connectionAttempts.getOrDefault(targetAddress, 0) + 1);
        
        if (isSuccessful) {
            this.connectionStatus = "CONNECTED";
            logConnection("CONNECT", "Success");
            this.connectionSpeed = calculateRandomSpeed();
            this.isSecure = evaluateConnectionSecurity();
        } else {
            this.retryCount++;
            this.connectionStatus = "FAILED";
            logConnection("CONNECT", "Failed - Attempt " + retryCount);
        }
        
        return isSuccessful;
    }
    
    /**
     * Simulates calculating connection speed
     * @return double representing connection speed in Mbps
     */
    private double calculateRandomSpeed() {
        return 10.0 + (Math.random() * 90.0); // Random speed between 10-100 Mbps
    }
    
    /**
     * Evaluates if the connection is secure
     * @return boolean indicating security status
     */
    private boolean evaluateConnectionSecurity() {
        return Math.random() > 0.1; // 90% chance of secure connection
    }
    
    /**
     * Logs connection activities
     * @param action The action being performed
     * @param result The result of the action
     */
    private void logConnection(String action, String result) {
        connectionHistory.add(new ConnectionLog(action, result));
    }
    
    /**
     * Retrieves connection statistics
     * @return String containing connection statistics
     */
    public String getConnectionStats() {
        StringBuilder stats = new StringBuilder();
        stats.append("Connection Statistics:\n");
        stats.append("ID: ").append(connectionId).append("\n");
        stats.append("Status: ").append(connectionStatus).append("\n");
        stats.append("Connection Time: ").append(connectionTime).append("\n");
        stats.append("Retry Count: ").append(retryCount).append("\n");
        stats.append("Connection Speed: ").append(String.format("%.2f", connectionSpeed)).append(" Mbps\n");
        stats.append("Secure Connection: ").append(isSecure).append("\n");
        
        return stats.toString();
    }
    
    /**
     * Retrieves connection history
     * @return ArrayList<String> containing connection history
     */
    public ArrayList<String> getConnectionHistory() {
        ArrayList<String> history = new ArrayList<>();
        for (ConnectionLog log : connectionHistory) {
            history.add(log.toString());
        }
        return history;
    }
    
    /**
     * Checks if maximum retry attempts have been reached
     * @return boolean indicating if max retries reached
     */
    public boolean hasReachedMaxRetries() {
        return retryCount >= MAX_RETRY_ATTEMPTS;
    }
    
    /**
     * Resets connection statistics
     */
    public void resetConnection() {
        this.connectionStatus = "RESET";
        this.retryCount = 0;
        this.connectionSpeed = 0.0;
        this.isSecure = false;
        logConnection("RESET", "Connection reset successful");
    }
    
    /**
     * Gets the current connection status
     * @return String current connection status
     */
    public String getConnectionStatus() {
        return this.connectionStatus;
    }
    
    /**
     * Gets the connection speed
     * @return double current connection speed
     */
    public double getConnectionSpeed() {
        return this.connectionSpeed;
    }
    
    /**
     * Checks if the connection is secure
     * @return boolean indicating if connection is secure
     */
    public boolean isSecureConnection() {
        return this.isSecure;
    }
}
