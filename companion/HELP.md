# Harvest Timesheets Integration
### A simple Companion integration to manipulate your Harvest timesheets from buttons

You will need to create a Harvest user token by logging into the Harvest web site.  Enter your user token into the config, along with the api base URL from the harvest website, and your organization's account code.

### Things you can do
- Toggle the timer on the currently running task - this is fetched from the task that is currently running, or the most recently updated task started today.

- Explicitly start or stop the timer.  Good in combination with a "going for lunch" button.

- Start timing on a specific project and task.  If you have an existing entry today, this will be restarted.  If not, a new entry will be created with this project, task, and notes value.

- Display feedback on whether or not any timer is running

- Display feedback if a timer is running on a given project or task

- Use a variable to display the current running timer's project and task.

- Use a variable to display the accumulated time of a given timer

- Create new buttons from templates generated from all of your assigned projects and tasks