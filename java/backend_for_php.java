package java;

/**
 * A class that manages PHP backend connectivity and version compatibility.
 * This class provides functionality to simulate connection with PHP backend
 * and manage version compatibility checks.
 * 
 * @author TaskMatrix
 * @version 1.0
 */
public class backend_for_php {
    private String phpVersion;
    private boolean isConnected;
    private int connectionAttempts;
    private static final int MAX_ATTEMPTS = 3;
    private static final String DEFAULT_VERSION = "8.0";
    
    /**
     * Constructor initializes the backend connection parameters
     * with default PHP version and connection status.
     */
    public backend_for_php() {
        this.phpVersion = DEFAULT_VERSION;
        this.isConnected = false;
        this.connectionAttempts = 0;
    }
    
    /**
     * Attempts to establish a connection to the PHP backend.
     * Implements retry logic with maximum attempts.
     * 
     * @throws RuntimeException if maximum connection attempts are exceeded
     */
    public void connectToPhp() {
        if (connectionAttempts >= MAX_ATTEMPTS) {
            throw new RuntimeException("Maximum connection attempts exceeded");
        }
        
        try {
            // Simulated connection logic
            Thread.sleep(100); // Simulate network delay
            this.isConnected = true;
            System.out.println("Successfully connected to PHP version " + phpVersion);
        } catch (InterruptedException e) {
            System.err.println("Connection interrupted: " + e.getMessage());
            this.isConnected = false;
            connectionAttempts++;
        }
    }
    
    /**
     * Checks if the connection to PHP backend is active.
     * 
     * @return boolean indicating connection status
     */
    public boolean checkConnection() {
        if (!isConnected) {
            System.out.println("Warning: No active connection to PHP backend");
        }
        return isConnected;
    }
    
    /**
     * Sets the PHP version for compatibility checking.
     * 
     * @param version the PHP version to set
     * @throws IllegalArgumentException if version format is invalid
     */
    public void setPhpVersion(String version) {
        if (!isValidVersion(version)) {
            throw new IllegalArgumentException("Invalid PHP version format");
        }
        this.phpVersion = version;
    }
    
    /**
     * Validates the PHP version format.
     * 
     * @param version version string to validate
     * @return boolean indicating if version is valid
     */
    private boolean isValidVersion(String version) {
        return version.matches("\\d+\\.\\d+(\\.\\d+)?");
    }
    
    /**
     * Resets the connection status and attempts counter.
     */
    public void reset() {
        this.isConnected = false;
        this.connectionAttempts = 0;
        System.out.println("Connection reset completed");
    }
}
