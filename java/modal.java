package java;

import java.util.ArrayList;
import java.util.List;

/**
 * A class representing a modal dialog component with advanced functionality.
 * This class manages modal windows with customizable content and behavior.
 * 
 * @author TaskMatrix
 * @version 1.0
 */
public class modal {
    private String modalTitle;
    private String modalContent;
    private boolean isVisible;
    private List<String> modalHistory;
    private static final int MAX_TITLE_LENGTH = 100;
    private static final int MAX_CONTENT_LENGTH = 1000;
    
    /**
     * Constructor initializes a new modal with the specified title.
     * 
     * @param title the title for the modal
     * @throws IllegalArgumentException if title is invalid
     */
    public modal(String title) {
        validateTitle(title);
        this.modalTitle = title;
        this.isVisible = false;
        this.modalHistory = new ArrayList<>();
    }
    
    /**
     * Displays the modal with specified content.
     * 
     * @param content the content to display in the modal
     * @throws IllegalArgumentException if content is invalid
     */
    public void showModal(String content) {
        validateContent(content);
        this.modalContent = content;
        this.isVisible = true;
        modalHistory.add("Modal shown: " + modalTitle);
        System.out.println("Displaying modal: " + modalTitle);
        System.out.println("Content: " + modalContent);
    }
    
    /**
     * Hides the currently displayed modal.
     */
    public void hideModal() {
        if (isVisible) {
            this.isVisible = false;
            modalHistory.add("Modal hidden: " + modalTitle);
            System.out.println("Modal hidden");
        } else {
            System.out.println("Modal is already hidden");
        }
    }
    
    /**
     * Updates the modal title with validation.
     * 
     * @param newTitle the new title for the modal
     * @throws IllegalArgumentException if title is invalid
     */
    public void updateTitle(String newTitle) {
        validateTitle(newTitle);
        modalHistory.add("Title changed from: " + this.modalTitle + " to: " + newTitle);
        this.modalTitle = newTitle;
    }
    
    /**
     * Validates the modal title.
     * 
     * @param title the title to validate
     * @throws IllegalArgumentException if title is invalid
     */
    private void validateTitle(String title) {
        if (title == null || title.trim().isEmpty()) {
            throw new IllegalArgumentException("Modal title cannot be empty");
        }
        if (title.length() > MAX_TITLE_LENGTH) {
            throw new IllegalArgumentException("Modal title exceeds maximum length");
        }
    }
    
    /**
     * Validates the modal content.
     * 
     * @param content the content to validate
     * @throws IllegalArgumentException if content is invalid
     */
    private void validateContent(String content) {
        if (content == null) {
            throw new IllegalArgumentException("Modal content cannot be null");
        }
        if (content.length() > MAX_CONTENT_LENGTH) {
            throw new IllegalArgumentException("Modal content exceeds maximum length");
        }
    }
    
    /**
     * Returns the modal's visibility status.
     * 
     * @return boolean indicating if modal is visible
     */
    public boolean isModalVisible() {
        return isVisible;
    }
    
    /**
     * Returns the history of modal operations.
     * 
     * @return List<String> containing modal operation history
     */
    public List<String> getModalHistory() {
        return new ArrayList<>(modalHistory);
    }
}
