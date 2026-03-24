// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    const calendar = document.getElementById('calendar');
    const currentMonthElement = document.getElementById('current-month');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const todayBtn = document.getElementById('today-btn');
    const monthSelector = document.getElementById('month-selector');
    const yearSelector = document.getElementById('year-selector');
    const taskList = document.getElementById('task-list');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const importantEventsList = document.getElementById('important-events-list');
    const upcomingEvents = document.getElementById('upcoming-events');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskModal = document.getElementById('task-modal');
    const taskModalTitle = document.querySelector('#task-modal .modal-header h3');
    const closeTaskModal = document.getElementById('close-task-modal');
    const cancelTaskBtn = document.getElementById('cancel-task');
    const taskForm = document.getElementById('task-form');
    const taskIdInput = document.getElementById('task-id');
    const taskTextInput = document.getElementById('task-text');
    const taskImportantCheckbox = document.getElementById('task-important');
    const taskDailyCheckbox = document.getElementById('task-daily');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-close');
    const sidebar = document.getElementById('sidebar');
    
    // Dark Mode Elements
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const darkModeIcon = document.getElementById('dark-mode-icon');

    let currentDate = new Date();
    let selectedDate = null;
    let tasks = [];
    let dailyTaskCompletions = {}; 
    let editingTaskId = null;

    // Load tasks from localStorage
    function loadTasks() {
        const savedTasks = localStorage.getItem('calendarTasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
        }
        
        const savedCompletions = localStorage.getItem('dailyTaskCompletions');
        if (savedCompletions) {
            dailyTaskCompletions = JSON.parse(savedCompletions);
        }
        
        deleteOldTasks();
    }

    // Delete tasks older than 30 days
    function deleteOldTasks() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        
        const originalLength = tasks.length;
        tasks = tasks.filter(task => {
            if (task.daily) return true;
            const taskDate = new Date(task.date);
            return taskDate >= thirtyDaysAgo;
        });
        
        if (tasks.length < originalLength) {
            saveTasks();
        }
    }

    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('calendarTasks', JSON.stringify(tasks));
        localStorage.setItem('dailyTaskCompletions', JSON.stringify(dailyTaskCompletions));
    }

    // Load dark mode preference from localStorage
    function loadDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'true';
        if (isDarkMode) {
            enableDarkMode();
        } else {
            disableDarkMode();
        }
    }

    // Save dark mode preference to localStorage
    function saveDarkMode(isDarkMode) {
        localStorage.setItem('darkMode', isDarkMode);
    }

    // Enable dark mode
    function enableDarkMode() {
        document.body.classList.add('dark-mode');
        darkModeIcon.classList.remove('fa-moon');
        darkModeIcon.classList.add('fa-sun');
    }

    // Disable dark mode
    function disableDarkMode() {
        document.body.classList.remove('dark-mode');
        darkModeIcon.classList.remove('fa-sun');
        darkModeIcon.classList.add('fa-moon');
    }

    // Toggle dark mode
    function toggleDarkMode() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        if (isDarkMode) {
            disableDarkMode();
            saveDarkMode(false);
        } else {
            enableDarkMode();
            saveDarkMode(true);
        }
    }

    function closeSidebarMenu() {
        sidebar.classList.remove('active');
        const menuIcon = menuToggle.querySelector('i');
        if (menuIcon) {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        }
    }

    // Format date as YYYY-MM-DD
    function formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Format date for display
    function formatDateDisplay(date) {
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    // Format date for full display
    function formatDateFull(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }

    // Check if a daily task is completed on a specific date
    function isDailyTaskCompleted(taskId, date) {
        const dateString = formatDate(date);
        if (!dailyTaskCompletions[taskId]) return false;
        return dailyTaskCompletions[taskId].includes(dateString);
    }

    // Mark a daily task as completed on a specific date
    function markDailyTaskCompleted(taskId, date, completed) {
        const dateString = formatDate(date);
        if (!dailyTaskCompletions[taskId]) {
            dailyTaskCompletions[taskId] = [];
        }
        
        if (completed && !dailyTaskCompletions[taskId].includes(dateString)) {
            dailyTaskCompletions[taskId].push(dateString);
        } else if (!completed && dailyTaskCompletions[taskId].includes(dateString)) {
            const index = dailyTaskCompletions[taskId].indexOf(dateString);
            dailyTaskCompletions[taskId].splice(index, 1);
        }
        
        saveTasks();
    }

    // Render calendar
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        
        currentMonthElement.textContent = new Date(year, month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        monthSelector.value = month;
        yearSelector.value = year;
        
        calendar.innerHTML = '';
        
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'day-name';
            dayElement.textContent = day;
            calendar.appendChild(dayElement);
        });
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();
        
        for (let i = firstDay - 1; i >= 0; i--) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = daysInPrevMonth - i;
            calendar.appendChild(dayElement);
        }
        
        for (let i = 1; i <= daysInMonth; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = i;
            
            const date = new Date(year, month, i);
            const dateString = formatDate(date);
            
            const hasRegularTasks = tasks.some(task => task.date === dateString && !task.daily);
            if (hasRegularTasks) {
                dayElement.classList.add('has-tasks');
            }
            
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElement.classList.add('today');
            }
            
            if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
                dayElement.classList.add('selected');
            }
            
            dayElement.addEventListener('click', () => selectDate(date));
            calendar.appendChild(dayElement);
        }
        
        const totalCells = calendar.children.length - 7;
        const remainingCells = 35 - totalCells;
        for (let i = 1; i <= remainingCells; i++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day other-month';
            dayElement.textContent = i;
            calendar.appendChild(dayElement);
        }
    }

    // Select a date
    function selectDate(date) {
        selectedDate = date;
        renderCalendar();
        renderTasks();
        renderImportantEvents();
        selectedDateDisplay.textContent = formatDateFull(date);
        updateSummary();
    }

    // Render tasks for selected date
    function renderTasks() {
        if (!selectedDate) {
            taskList.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-check"></i><p>Select a date to view tasks</p></div>`;
            return;
        }
        
        const dateString = formatDate(selectedDate);
        const regularTasks = tasks.filter(task => task.date === dateString && !task.daily && !task.important);
        const dailyTasks = tasks.filter(task => task.daily && !task.important);
        const allTasks = [...dailyTasks, ...regularTasks];
        
        if (allTasks.length === 0) {
            taskList.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-check"></i><p>No tasks for this date</p></div>`;
            return;
        }
        
        taskList.innerHTML = '';
        allTasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.daily ? 'daily-task' : ''}`;
            
            let isCompleted = task.completed;
            if (task.daily) {
                isCompleted = isDailyTaskCompleted(task.id, selectedDate);
            }
            
            if (isCompleted) taskItem.classList.add('completed');
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'task-checkbox';
            checkbox.checked = isCompleted;
            checkbox.addEventListener('change', () => toggleTask(task.id, task.daily));
            
            const taskText = document.createElement('div');
            taskText.className = 'task-text';
            taskText.textContent = task.text;
            
            if (task.daily) {
                const dailyBadge = document.createElement('span');
                dailyBadge.style.cssText = 'font-size: 10px; color: var(--daily-task-color); margin-left: 5px;';
                dailyBadge.textContent = '(Daily)';
                taskText.appendChild(dailyBadge);
            }
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'task-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTask(task.id, task.daily));

            const editBtn = document.createElement('button');
            editBtn.className = 'task-edit';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.addEventListener('click', () => startEditTask(task.id));

            const actions = document.createElement('div');
            actions.className = 'task-actions';
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            taskItem.appendChild(checkbox);
            taskItem.appendChild(taskText);
            taskItem.appendChild(actions);
            taskList.appendChild(taskItem);
        });
    }

    // Render important events for selected date
    function renderImportantEvents() {
        if (!selectedDate) {
            importantEventsList.innerHTML = `<div class="empty-state"><p>Select a date to view important events</p></div>`;
            return;
        }
        
        const dateString = formatDate(selectedDate);
        const regularImportantTasks = tasks.filter(task => task.date === dateString && task.important && !task.daily);
        const dailyImportantTasks = tasks.filter(task => task.daily && task.important);
        const allImportantTasks = [...dailyImportantTasks, ...regularImportantTasks];
        
        if (allImportantTasks.length === 0) {
            importantEventsList.innerHTML = `<div class="empty-state"><p>No important events for the selected date</p></div>`;
            return;
        }
        
        importantEventsList.innerHTML = '';
        allImportantTasks.forEach(task => {
            const eventItem = document.createElement('div');
            eventItem.className = `event-item ${task.daily ? 'daily-event' : ''}`;
            
            let isCompleted = task.completed;
            if (task.daily) isCompleted = isDailyTaskCompleted(task.id, selectedDate);
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'event-checkbox';
            checkbox.checked = isCompleted;
            checkbox.addEventListener('change', () => toggleTask(task.id, task.daily));
            
            const eventText = document.createElement('div');
            eventText.className = 'event-text';
            eventText.textContent = task.text;
            
            if (task.daily) {
                const dailyBadge = document.createElement('span');
                dailyBadge.style.cssText = 'font-size: 10px; color: var(--daily-task-color); margin-left: 5px;';
                dailyBadge.textContent = '(Daily)';
                eventText.appendChild(dailyBadge);
            }
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'event-delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => deleteTask(task.id, task.daily));

            const editBtn = document.createElement('button');
            editBtn.className = 'event-edit';
            editBtn.innerHTML = '<i class="fas fa-pen"></i>';
            editBtn.addEventListener('click', () => startEditTask(task.id));

            const actions = document.createElement('div');
            actions.className = 'event-actions';
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            eventItem.appendChild(checkbox);
            eventItem.appendChild(eventText);
            eventItem.appendChild(actions);
            importantEventsList.appendChild(eventItem);
        });
    }

    // Render upcoming events in sidebar
    function renderUpcomingEvents() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const futureEvents = tasks
            .filter(task => {
                if (!task.important) return false;
                if (task.daily) return true;
                const taskDate = new Date(task.date);
                return taskDate >= today;
            })
            .sort((a, b) => {
                if (a.daily && !b.daily) return -1;
                if (!a.daily && b.daily) return 1;
                if (!a.daily && !b.daily) return new Date(a.date) - new Date(b.date);
                return 0;
            })
            .slice(0, 10);
        
        if (futureEvents.length === 0) {
            upcomingEvents.innerHTML = `<div class="empty-state"><i class="fas fa-calendar-alt"></i><p>No upcoming events</p></div>`;
            return;
        }
        
        upcomingEvents.innerHTML = '';
        futureEvents.forEach((task) => {
            const eventBadge = document.createElement('div');
            eventBadge.className = 'event-badge';
            
            if (!task.daily) {
                const taskDate = new Date(task.date);
                const daysUntilEvent = Math.ceil((taskDate - today) / (1000 * 60 * 60 * 24));
                if (daysUntilEvent <= 3) eventBadge.classList.add('near-event');
                else if (daysUntilEvent <= 7) eventBadge.classList.add('medium-event');
                else eventBadge.classList.add('far-event');
            } else {
                eventBadge.classList.add('near-event');
            }
            
            let eventDateText = task.daily ? 'Daily' : formatDateDisplay(new Date(task.date));
            
            const eventDate = document.createElement('div');
            eventDate.className = 'event-date';
            eventDate.textContent = eventDateText;
            
            const eventTitle = document.createElement('div');
            eventTitle.className = 'event-title';
            eventTitle.textContent = task.text;
            
            const eventType = document.createElement('div');
            eventType.className = 'event-type';
            
            if (task.daily) {
                eventType.textContent = 'Daily';
                eventType.style.backgroundColor = 'var(--daily-task-color)';
            } else if (task.text.toLowerCase().includes('meeting')) eventType.textContent = 'Meeting';
            else if (task.text.toLowerCase().includes('exam')) eventType.textContent = 'Exam';
            else if (task.text.toLowerCase().includes('event')) eventType.textContent = 'Event';
            else eventType.textContent = 'Important';
            
            eventBadge.appendChild(eventDate);
            eventBadge.appendChild(eventTitle);
            eventBadge.appendChild(eventType);
            
            eventBadge.addEventListener('click', () => {
                if (!task.daily) selectDate(new Date(task.date));
                else selectDate(new Date());
                if (window.innerWidth <= 768) closeSidebarMenu();
            });
            
            upcomingEvents.appendChild(eventBadge);
        });
    }

    // Toggle task completion
    function toggleTask(taskId, isDaily) {
        if (isDaily) {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                const isCompleted = isDailyTaskCompleted(taskId, selectedDate);
                markDailyTaskCompleted(taskId, selectedDate, !isCompleted);
                renderTasks();
                renderImportantEvents();
                renderUpcomingEvents();
                updateSummary();
            }
        } else {
            const task = tasks.find(t => t.id === taskId);
            if (task) {
                task.completed = !task.completed;
                saveTasks();
                renderTasks();
                renderImportantEvents();
                renderUpcomingEvents();
                updateSummary();
            }
        }
    }

    // Delete task
    function deleteTask(taskId, isDaily) {
        if (isDaily) delete dailyTaskCompletions[taskId];
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        renderImportantEvents();
        renderCalendar();
        renderUpcomingEvents();
        updateSummary();
    }

    function startEditTask(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        editingTaskId = task.id;
        taskIdInput.value = String(task.id);
        taskTextInput.value = task.text;
        taskImportantCheckbox.checked = !!task.important;
        taskDailyCheckbox.checked = !!task.daily;
        if (!task.daily && task.date) {
            selectedDate = new Date(task.date);
            currentDate = new Date(task.date);
            renderCalendar();
            selectedDateDisplay.textContent = formatDateFull(selectedDate);
        }
        taskModalTitle.textContent = 'Edit Task';
        showTaskModal();
    }

    function updateSummary() {
        if (!selectedDate) {
            document.getElementById('completed-count').textContent = '0';
            document.getElementById('pending-count').textContent = '0';
            document.getElementById('important-count').textContent = '0';
            document.getElementById('summary-date').textContent = '📅 Select Date';
            return;
        }

        const selectedDateString = formatDate(selectedDate);
        const tasksForDate = tasks.filter(task => task.daily || task.date === selectedDateString);

        let completed = 0;
        let pending = 0;
        let important = 0;

        tasksForDate.forEach(task => {
            const taskIsCompleted = task.daily
                ? isDailyTaskCompleted(task.id, selectedDate)
                : task.completed;

            if (taskIsCompleted) {
                completed += 1;
            } else {
                pending += 1;
            }

            if (task.important) {
                important += 1;
            }
        });

        document.getElementById('completed-count').textContent = String(completed);
        document.getElementById('pending-count').textContent = String(pending);
        document.getElementById('important-count').textContent = String(important);

        document.getElementById('summary-date').textContent = `📅 ${selectedDate.toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })}`;
    }

    function showTaskModal() { taskModal.style.display = 'flex'; }
    function hideTaskModal() {
        taskModal.style.display = 'none';
        editingTaskId = null;
        taskIdInput.value = '';
        taskModalTitle.textContent = 'Add New Task';
        taskForm.reset();
    }

    // Event listeners
    prevMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); });
    nextMonthBtn.addEventListener('click', () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); });
    todayBtn.addEventListener('click', () => { const today = new Date(); currentDate = new Date(today); selectDate(today); });
    monthSelector.addEventListener('change', (e) => { currentDate.setMonth(parseInt(e.target.value)); renderCalendar(); });
    yearSelector.addEventListener('change', (e) => { currentDate.setFullYear(parseInt(e.target.value)); renderCalendar(); });

    addTaskBtn.addEventListener('click', showTaskModal);
    closeTaskModal.addEventListener('click', hideTaskModal);
    cancelTaskBtn.addEventListener('click', hideTaskModal);

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const taskText = taskTextInput.value.trim();
        if (!taskText) return;
        if (!selectedDate && !taskDailyCheckbox.checked) {
            alert('Please select a date first');
            return;
        }

        if (editingTaskId) {
            const task = tasks.find(t => t.id === editingTaskId);
            if (task) {
                task.text = taskText;
                task.important = taskImportantCheckbox.checked;
                task.daily = taskDailyCheckbox.checked;
                task.date = taskDailyCheckbox.checked ? null : formatDate(selectedDate);
            }
        } else {
            const newTask = {
                id: Date.now(),
                text: taskText,
                date: taskDailyCheckbox.checked ? null : formatDate(selectedDate),
                important: taskImportantCheckbox.checked,
                daily: taskDailyCheckbox.checked,
                completed: false
            };
            tasks.push(newTask);
        }

        saveTasks();
        renderTasks();
        renderImportantEvents();
        renderCalendar();
        renderUpcomingEvents();
        updateSummary();
        hideTaskModal();
    });

    // Dark Mode Listener
    darkModeToggle.addEventListener('click', toggleDarkMode);

    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        const menuIcon = menuToggle.querySelector('i');
        if (!menuIcon) return;
        if (sidebar.classList.contains('active')) {
            menuIcon.classList.remove('fa-bars');
            menuIcon.classList.add('fa-xmark');
        } else {
            menuIcon.classList.remove('fa-xmark');
            menuIcon.classList.add('fa-bars');
        }
    });

    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', closeSidebarMenu);
    }

    window.addEventListener('click', (e) => { if (e.target === taskModal) hideTaskModal(); });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target) && sidebar.classList.contains('active')) {
            closeSidebarMenu();
        }
    });

    // Initialize app
    loadTasks();
    loadDarkMode();
    renderCalendar();
    renderUpcomingEvents();
    selectDate(new Date());
});