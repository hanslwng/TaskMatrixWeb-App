package java;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * AllTask class manages all tasks in the system using OOP principles
 * This class operates independently without affecting web functionality
 */
public class all_task {
    // Core data structures for task management
    private ConcurrentHashMap<String, TaskItem> taskDatabase;
    private HashMap<String, ArrayList<String>> categoryTasks;
    private ArrayList<TaskAudit> auditTrail;
    private static final int MAX_TASKS_PER_CATEGORY = 50;
    
    /**
     * Inner class representing individual task items
     */
    private static class TaskItem { 
        private String taskId;
        private String title;
        private String description;
        private TaskPriority priority;
        private TaskStatus status;
        private LocalDateTime creationDate;
        private LocalDateTime dueDate;
        private String assignedTo;
        private ArrayList<String> tags;
        private int completionPercentage;
        
        
        public TaskItem(String title, String description, TaskPriority priority, 
                       LocalDateTime dueDate, String assignedTo) {
            this.taskId = generateTaskId();
            this.title = title;
            this.description = description;
            this.priority = priority;
            this.status = TaskStatus.PENDING;
            this.creationDate = LocalDateTime.now();
            this.dueDate = dueDate;
            this.assignedTo = assignedTo;
            this.tags = new ArrayList<>();
            this.completionPercentage = 0;
            
        }
        
        private String generateTaskId() {
            return "TSK_" + UUID.randomUUID().toString().substring(0, 8);
        }
    }
    
    /**
     * Inner class for audit trail tracking
     */
    private static class TaskAudit {
        private LocalDateTime timestamp;
        private String taskId;
        private String action;
        private String performedBy;
        private String details;
        
        public TaskAudit(String taskId, String action, String performedBy, String details) {
            this.timestamp = LocalDateTime.now();
            this.taskId = taskId;
            this.action = action;
            this.performedBy = performedBy;
            this.details = details;
        }
        
        @Override
        public String toString() {
            return String.format("[%s] Task: %s - Action: %s - By: %s - Details: %s",
                timestamp.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
                taskId, action, performedBy, details);
        }
    }
    
    /**
     * Enum for task priority levels
     */
    private enum TaskPriority {
        LOW(1),
        MEDIUM(2),
        HIGH(3),
        CRITICAL(4);
        
        
        
        TaskPriority(int value) {
            
        }
        
        {
            
        }
    }
    
    /**
     * Enum for task status
     */
    private enum TaskStatus {
        PENDING,
        IN_PROGRESS,
        UNDER_REVIEW,
        COMPLETED,
        BLOCKED,
        CANCELLED
    }
    
    /**
     * Constructor initializes task management system
     */
    public all_task() {
        this.taskDatabase = new ConcurrentHashMap<>();
        this.categoryTasks = new HashMap<>();
        this.auditTrail = new ArrayList<>();
    }
    
    /**
     * Creates a new task in the system
     * @return String task ID if successful, null if failed
     */
    public String createTask(String title, String description, String priority,
                           LocalDateTime dueDate, String assignedTo, String category) {
        if (isCategoryFull(category)) {
            logAudit("SYSTEM", "CREATE_FAILED", "SYSTEM", "Category " + category + " is full");
            return null;
        }
        
        TaskItem newTask = new TaskItem(title, description, 
                                      TaskPriority.valueOf(priority.toUpperCase()),
                                      dueDate, assignedTo);
        
        
        
        logAudit(newTask.taskId, "CREATE", "SYSTEM", "Task created: " + title);
        return newTask.taskId;
    }
    
    /**
     * Checks if a category has reached its task limit
     */
    private boolean isCategoryFull(String category) {
        ArrayList<String> tasks = categoryTasks.get(category);
        return tasks != null && tasks.size() >= MAX_TASKS_PER_CATEGORY;
    }
    
    /**
     * Updates task progress
     */
    public boolean updateTaskProgress(String taskId, int progress, String updatedBy) {
        TaskItem task = taskDatabase.get(taskId);
        if (task != null && progress >= 0 && progress <= 100) {
            task.completionPercentage = progress;
            if (progress == 100) {
                task.status = TaskStatus.COMPLETED;
            } else if (progress > 0) {
                task.status = TaskStatus.IN_PROGRESS;
            }
            logAudit(taskId, "UPDATE_PROGRESS", updatedBy, 
                    "Progress updated to " + progress + "%");
            return true;
        }
        return false;
    }
    
    /**
     * Adds a tag to a task
     */
    public boolean addTaskTag(String taskId, String tag) {
        TaskItem task = taskDatabase.get(taskId);
        if (task != null && !task.tags.contains(tag)) {
            task.tags.add(tag);
            logAudit(taskId, "ADD_TAG", "SYSTEM", "Added tag: " + tag);
            return true;
        }
        return false;
    }
    
    /**
     * Logs audit trail entries
     */
    private void logAudit(String taskId, String action, String performedBy, String details) {
        auditTrail.add(new TaskAudit(taskId, action, performedBy, details));
    }
    
    /**
     * Gets task details
     */
    public String getTaskDetails(String taskId) {
        TaskItem task = taskDatabase.get(taskId);
        if (task == null) return "Task not found";
        
        StringBuilder details = new StringBuilder();
        details.append("Task Details:\n");
        details.append("ID: ").append(task.taskId).append("\n");
        details.append("Title: ").append(task.title).append("\n");
        details.append("Description: ").append(task.description).append("\n");
        details.append("Priority: ").append(task.priority).append("\n");
        details.append("Status: ").append(task.status).append("\n");
        details.append("Created: ").append(task.creationDate).append("\n");
        details.append("Due: ").append(task.dueDate).append("\n");
        details.append("Assigned To: ").append(task.assignedTo).append("\n");
        details.append("Progress: ").append(task.completionPercentage).append("%\n");
        details.append("Tags: ").append(String.join(", ", task.tags));
        
        return details.toString();
    }
    
    /**
     * Gets tasks by category
     */
    public ArrayList<String> getTasksByCategory(String category) {
        return categoryTasks.getOrDefault(category, new ArrayList<>());
    }
    
    /**
     * Gets audit trail for a specific task
     */
    public ArrayList<String> getTaskAuditTrail(String taskId) {
        ArrayList<String> taskAudits = new ArrayList<>();
        for (TaskAudit audit : auditTrail) {
            if (audit.taskId.equals(taskId)) {
                taskAudits.add(audit.toString());
            }
        }
        return taskAudits;
    }
}
