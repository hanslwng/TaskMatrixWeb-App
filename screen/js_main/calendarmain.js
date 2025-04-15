document.addEventListener('DOMContentLoaded', function() {
    const calendar = {
        currentDate: new Date(),
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        init: function() {
            this.renderCalendar();
            this.attachEventListeners();
            this.initScheduleForm();
            this.initMiniCalendar();
            this.initCategories();
        },

        initScheduleForm: function() {
            const self = this;
            const scheduleForm = document.querySelector('.schedule-form');
            if (!scheduleForm) return;

            // Event type selection
            const typeOptions = document.querySelectorAll('.event-type-option');
            typeOptions.forEach(option => {
                option.addEventListener('click', () => {
                    typeOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                });
            });

            // Get the save button and add click handler
            const saveButton = scheduleForm.querySelector('.save-btn');
            saveButton.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();

                // Get form values
                const formData = {
                    eventName: scheduleForm.querySelector('input[placeholder="Event Name"]').value,
                    eventDate: scheduleForm.querySelector('#schedule-date').value,
                    startTime: scheduleForm.querySelector('.time-inputs input[type="time"]:first-of-type').value,
                    endTime: scheduleForm.querySelector('.time-inputs input[type="time"]:last-of-type').value,
                    description: scheduleForm.querySelector('input[placeholder="Add Description"]').value,
                    type: document.querySelector('.event-type-option.selected')?.dataset.type || 'personal'
                };

                // Validate required fields
                if (!formData.eventName || !formData.eventDate || !formData.startTime) {
                    alert('Please fill in all required fields (Event Name, Date, and Start Time)');
                    return;
                }

                // Add event to calendar
                const success = self.addEventToCalendar({
                    text: formData.eventName,
                    date: formData.eventDate,
                    startTime: formData.startTime,
                    endTime: formData.endTime,
                    description: formData.description,
                    type: formData.type
                });

                if (success) {
                    // Reset form
                    scheduleForm.reset();
                    typeOptions.forEach(opt => opt.classList.remove('selected'));

                    // Remove any existing success message
                    const existingMessage = document.querySelector('.success-message');
                    if (existingMessage) {
                        existingMessage.remove();
                    }

                    // Show success message
                    const successMessage = document.createElement('div');
                    successMessage.className = 'success-message';
                    successMessage.textContent = 'Event added successfully!';
                    
                    // Add the success message after the form
                    scheduleForm.parentNode.insertBefore(successMessage, scheduleForm.nextSibling);
                    
                    setTimeout(() => {
                        if (successMessage.parentNode) {
                            successMessage.remove();
                        }
                    }, 3000);
                }
            });
        },

        addEventToCalendar: function(eventData) {
            try {
                const dayElement = document.querySelector(`.day[data-date="${eventData.date}"]`);
                
                if (!dayElement) {
                    alert('Selected date is not in the current month view. Please navigate to the correct month.');
                    return false;
                }

                // Create event tag
                const eventTag = document.createElement('div');
                eventTag.className = `event-tag event-${eventData.type}`;
                eventTag.textContent = eventData.text;

                // Add tooltip
                const tooltipText = `${eventData.startTime}${eventData.endTime ? ' - ' + eventData.endTime : ''}\n${eventData.description || ''}`;
                eventTag.setAttribute('title', tooltipText);

                // Find or create event container
                let eventContainer = dayElement.querySelector('.event-container');
                if (!eventContainer) {
                    eventContainer = document.createElement('div');
                    eventContainer.className = 'event-container';
                    dayElement.appendChild(eventContainer);
                }

                // Add the event
                eventContainer.appendChild(eventTag);

                // Add highlight effect
                dayElement.classList.add('day-updated');
                setTimeout(() => dayElement.classList.remove('day-updated'), 2000);

                return true;
            } catch (error) {
                console.error('Error adding event:', error);
                return false;
            }
        },

        renderCalendar: function() {
            const year = this.currentDate.getFullYear();
            const month = this.currentDate.getMonth();
            
            // Update calendar title
            const calendarTitle = document.querySelector('.calendar-title');
            calendarTitle.textContent = `${this.months[month]} ${year}`;
            
            // Get first and last day of month
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            // Clear and rebuild calendar grid
            const calendarGrid = document.querySelector('.calendar-grid');
            const weekdayHeaders = Array.from(calendarGrid.querySelectorAll('.weekday'));
            calendarGrid.innerHTML = '';
            weekdayHeaders.forEach(header => calendarGrid.appendChild(header));
            
            // Generate days HTML
            const daysHTML = this.generateDaysHTML(firstDay, lastDay);
            calendarGrid.innerHTML += daysHTML;
        },

        generateDaysHTML: function(firstDay, lastDay) {
            let html = '';
            
            // Empty cells before first day
            for (let i = 0; i < firstDay.getDay(); i++) {
                html += '<div class="day empty-day"></div>';
            }
            
            // Days of month
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
                const isToday = this.isToday(day);
                const dayClass = isToday ? 'day current-day' : 'day';
                
                html += `
                    <div class="${dayClass}" data-date="${this.formatDate(currentDate)}">
                        <span class="day-number">${day}</span>
                        <div class="event-container"></div>
                    </div>
                `;
            }
            
            // Empty cells after last day
            const totalCells = 42;
            const remainingCells = totalCells - (firstDay.getDay() + lastDay.getDate());
            for (let i = 0; i < remainingCells; i++) {
                html += '<div class="day empty-day"></div>';
            }
            
            return html;
        },

        formatDate: function(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        isToday: function(day) {
            const today = new Date();
            return day === today.getDate() && 
                   this.currentDate.getMonth() === today.getMonth() && 
                   this.currentDate.getFullYear() === today.getFullYear();
        },

        attachEventListeners: function() {
            const self = this;
            const navBtns = document.querySelectorAll('.nav-btn');
            navBtns[0].addEventListener('click', () => {
                self.currentDate = new Date(self.currentDate.getFullYear(), self.currentDate.getMonth() - 1, 1);
                self.renderCalendar();
            });
            navBtns[1].addEventListener('click', () => {
                self.currentDate = new Date(self.currentDate.getFullYear(), self.currentDate.getMonth() + 1, 1);
                self.renderCalendar();
            });
        },

        initMiniCalendar: function() {
            this.renderMiniCalendar();
            this.attachMiniCalendarListeners();
        },

        renderMiniCalendar: function() {
            const miniTitle = document.querySelector('.mini-calendar-title');
            const miniDays = document.querySelector('.mini-days');
            
            miniTitle.textContent = `${this.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
            miniDays.innerHTML = '';
            
            const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
            
            // Add empty cells for days before first day of month
            for (let i = 0; i < firstDay.getDay(); i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'mini-day empty';
                miniDays.appendChild(emptyDay);
            }
            
            // Add days of the month
            for (let i = 1; i <= lastDay.getDate(); i++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'mini-day';
                dayElement.textContent = i;
                
                if (this.isToday(i)) {
                    dayElement.classList.add('today');
                }
                
                dayElement.addEventListener('click', () => {
                    document.querySelectorAll('.mini-day').forEach(d => d.classList.remove('selected'));
                    dayElement.classList.add('selected');
                    
                    // Set the date in the schedule form
                    const dateInput = document.querySelector('#schedule-date');
                    if (dateInput) {
                        const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), i);
                        dateInput.value = this.formatDate(selectedDate);
                    }
                });
                
                miniDays.appendChild(dayElement);
            }
        },

        attachMiniCalendarListeners: function() {
            const self = this;
            const miniPrevBtn = document.querySelector('.mini-nav-btn.prev-month');
            const miniNextBtn = document.querySelector('.mini-nav-btn.next-month');
            
            miniPrevBtn.addEventListener('click', () => {
                self.currentDate = new Date(self.currentDate.getFullYear(), self.currentDate.getMonth() - 1, 1);
                self.renderCalendar();
                self.renderMiniCalendar();
            });
            
            miniNextBtn.addEventListener('click', () => {
                self.currentDate = new Date(self.currentDate.getFullYear(), self.currentDate.getMonth() + 1, 1);
                self.renderCalendar();
                self.renderMiniCalendar();
            });
        },

        // Category Management
        initCategories: function() {
            const addCategoryBtn = document.querySelector('.add-category-btn');
            if (addCategoryBtn) {
                addCategoryBtn.addEventListener('click', this.showAddCategoryModal.bind(this));
            }
        },

        showAddCategoryModal: function() {
            const modal = document.createElement('div');
            modal.className = 'category-modal';
            modal.innerHTML = `
                <div class="modal-header">
                    <h3>Add New Category</h3>
                    <button class="modal-close" onclick="this.closest('.category-modal').remove();document.querySelector('.modal-backdrop').style.display='none';">×</button>
                </div>
                <input type="text" placeholder="Category Name" class="category-name-input">
                <div class="color-picker-grid">
                    <div class="color-option" style="background-color: #FFD700" data-color="#FFD700"></div>
                    <div class="color-option" style="background-color: #FF9F40" data-color="#FF9F40"></div>
                    <div class="color-option" style="background-color: #FF6B6B" data-color="#FF6B6B"></div>
                    <div class="color-option" style="background-color: #9775FA" data-color="#9775FA"></div>
                    <div class="color-option" style="background-color: #4D7CFE" data-color="#4D7CFE"></div>
                    <div class="color-option" style="background-color: #50E3C2" data-color="#50E3C2"></div>
                </div>
                <button class="save-category-btn">Save Category</button>
            `;

            document.querySelector('.modal-backdrop').style.display = 'block';
            document.body.appendChild(modal);
            modal.style.display = 'block';

            // Color picker functionality
            let selectedColor = null;
            const colorOptions = modal.querySelectorAll('.color-option');
            colorOptions.forEach(option => {
                option.addEventListener('click', () => {
                    colorOptions.forEach(opt => opt.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedColor = option.dataset.color;
                });
            });

            // Save category functionality
            const saveBtn = modal.querySelector('.save-category-btn');
            saveBtn.addEventListener('click', () => {
                const categoryName = modal.querySelector('.category-name-input').value.trim();
                if (categoryName && selectedColor) {
                    this.addNewCategory(categoryName, selectedColor);
                    modal.remove();
                    document.querySelector('.modal-backdrop').style.display = 'none';
                    this.showSuccessModal('Category Added Successfully!');
                } else {
                    alert('Please enter a category name and select a color');
                }
            });
        },

        addNewCategory: function(name, color) {
            // Add to category list
            const categoryList = document.querySelector('.category-list');
            const newCategory = document.createElement('div');
            newCategory.className = 'category-item';
            newCategory.innerHTML = `
                <span class="category-dot" style="background-color: ${color}"></span>
                <span class="category-name">${name}</span>
            `;
            categoryList.appendChild(newCategory);

            // Add to event type options
            const eventTypeSelector = document.querySelector('.event-type-selector');
            const newEventType = document.createElement('div');
            newEventType.className = 'event-type-option';
            newEventType.dataset.type = name.toLowerCase().replace(/\s+/g, '-');
            newEventType.textContent = name;
            eventTypeSelector.appendChild(newEventType);

            // Add click handler
            newEventType.addEventListener('click', function() {
                document.querySelectorAll('.event-type-option').forEach(opt => opt.classList.remove('selected'));
                this.classList.add('selected');
            });
        },

        showSuccessModal: function(message) {
            const modal = document.createElement('div');
            modal.className = 'success-modal';
            modal.textContent = message;
            document.body.appendChild(modal);
            modal.style.display = 'block';

            setTimeout(() => {
                modal.remove();
            }, 3000);
        }
    };

    // Initialize the calendar
    calendar.init();
});
