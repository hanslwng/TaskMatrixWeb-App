package java;

import java.util.ArrayList;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.time.LocalDateTime;

/**
 * A server class that manages user connections and server status.
 * Provides functionality for user management and server monitoring.
 * 
 * @author TaskMatrix
 * @version 1.0
 */
public class server {
    private String serverName;
    private int port;
    private List<String> connectedUsers;
    private Map<String, LocalDateTime> userConnectionTimes;
    private boolean isRunning;
    private static final int MIN_PORT = 1024;
    private static final int MAX_PORT = 65535;
    
    /**
     * Constructor initializes the server with specified name and port.
     * 
     * @param name the server name
     * @param port the server port number
     * @throws IllegalArgumentException if port is invalid
     */
    public server(String name, int port) {
        validateServerName(name);
        validatePort(port);
        
        this.serverName = name;
        this.port = port;
        this.connectedUsers = new ArrayList<>();
        this.userConnectionTimes = new HashMap<>();
        this.isRunning = false;
    }
    
    /**
     * Starts the server if it's not already running.
     * 
     * @throws RuntimeException if server fails to start
     */
    public void startServer() {
        if (!isRunning) {
            try {
                // Simulated server startup logic
                Thread.sleep(100);
                this.isRunning = true;
                System.out.println("Server " + serverName + " started on port " + port);
            } catch (InterruptedException e) {
                throw new RuntimeException("Failed to start server: " + e.getMessage());
            }
        } else {
            System.out.println("Server is already running");
        }
    }
    
    /**
     * Adds a user to the server and records connection time.
     * 
     * @param username the username to add
     * @throws IllegalStateException if server is not running
     * @throws IllegalArgumentException if username is invalid
     */
    public void addUser(String username) {
        if (!isRunning) {
            throw new IllegalStateException("Server must be running to add users");
        }
        validateUsername(username);
        
        if (!connectedUsers.contains(username)) {
            connectedUsers.add(username);
            userConnectionTimes.put(username, LocalDateTime.now());
            System.out.println(username + " connected to " + serverName);
        } else {
            System.out.println("User " + username + " is already connected");
        }
    }
    
    /**
     * Removes a user from the server.
     * 
     * @param username the username to remove
     */
    public void removeUser(String username) {
        if (connectedUsers.remove(username)) {
            userConnectionTimes.remove(username);
            System.out.println(username + " disconnected from " + serverName);
        } else {
            System.out.println("User " + username + " was not connected");
        }
    }
    
    /**
     * Validates the server port number.
     * 
     * @param port the port to validate
     * @throws IllegalArgumentException if port is invalid
     */
    private void validatePort(int port) {
        if (port < MIN_PORT || port > MAX_PORT) {
            throw new IllegalArgumentException(
                "Port must be between " + MIN_PORT + " and " + MAX_PORT
            );
        }
    }
    
    /**
     * Validates the server name.
     * 
     * @param name the server name to validate
     * @throws IllegalArgumentException if name is invalid
     */
    private void validateServerName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Server name cannot be empty");
        }
    }
    
    /**
     * Validates the username.
     * 
     * @param username the username to validate
     * @throws IllegalArgumentException if username is invalid
     */
    private void validateUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be empty");
        }
    }
    
    /**
     * Returns the number of connected users.
     * 
     * @return int number of connected users
     */
    public int getConnectedUserCount() {
        return connectedUsers.size();
    }
    
    /**
     * Returns the server status.
     * 
     * @return boolean indicating if server is running
     */
    public boolean isServerRunning() {
        return isRunning;
    }
}
