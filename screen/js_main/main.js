let motivation;
let activityHistory;
document.addEventListener('DOMContentLoaded', function() {
    motivation = new DailyMotivation();
    activityHistory = new ActivityHistory();
    activityHistory.addActivity('CREATE', 'Created new task: Meeting with team');
    activityHistory.addActivity('DELETE', 'Deleted task: Old project review');
    activityHistory.addActivity('COMPLETE', 'Completed task: Weekly report');
}); 