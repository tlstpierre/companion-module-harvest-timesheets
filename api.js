import {
  InstanceStatus,
} from '@companion-module/base'

export function getItems(self){
  const date = new Date()
  const dateToday = date.getFullYear()+'-'+(date.getMonth()+1).toString().padStart(2, "0")+'-'+date.getDate().toString().padStart(2, "0")
  try {
    fetch(`${self.config.apiBase}/v2/time_entries?`+ new URLSearchParams(
      {
        'user_id': self.config.userId,
        'from': dateToday,
      }),
      {
        method: 'get',
        headers: {
          'Authorization': `Bearer ${self.config.token}`,
          'Harvest-Account-ID': self.config.accountId,
          'User-agent': 'Companion Timesheets (tstpierre@ting.com)'
        }
      }
    ) 
    .then( res => {
      if (res.ok){
        self.updateStatus(InstanceStatus.Ok)
        res.json()
        .then(data => {
          // Do things here
          self.log('debug',`json response from time_entries is ${JSON.stringify(data)}`)
          self.timeEntries = data.time_entries
          let foundTimer = false
          let entry = {}
          let newestTime = 0
          let newestItem = {}
          for (entry of data.time_entries){
            const updatedTime = Date.parse(entry.updated_at)
            if (updatedTime >= newestTime) {
              newestTime = updatedTime
              newestItem = entry
            }
            if (entry.is_running){
              self.setVariableValues({
                ['currentProjectCode']: entry.project.code, 
                ['currentProjectName']: entry.project.name,
                ['currentProjectId']: entry.project.id,
                ['currentTaskName']: entry.task.name,
                ['currentTaskId']: entry.task.id,
                ['timerRunning']: true,
                ['timerId']: entry.id,
                ['timerHours']: entry.hours
              })
              foundTimer = true
            }
          }
          if (!foundTimer) {
            self.setVariableValues({
              ['timerRunning']: false
            })
            if (newestTime > 0) {
              self.log('info',`Newest task is ${newestItem.id}`)
              self.setVariableValues({
                ['currentProjectCode']: newestItem.project.code, 
                ['currentProjectName']: newestItem.project.name,
                ['currentTaskName']: newestItem.task.name,
                ['currentTaskId']: newestItem.task.id,
                ['timerId']: newestItem.id,
                ['timerHours']: newestItem.hours
              })
            }
          }
          self.checkFeedbacks()
          
        })
      } else {
          self.log('error',res.statusText)
          self.updateStatus(InstanceStatus.BadConfig)
      }
    })
  } catch (err){
    self.log('error',`GET error was ${err.text}`)
  }
}

export function checkTimer(self){
  self.log('info','Checking for a running task timer')
  let isRunning = false // We will return this 
  let timerId = 0
  const date = new Date()
  const dateToday = date.getFullYear()+'-'+(date.getMonth()+1).toString().padStart(2, "0")+'-'+date.getDate().toString().padStart(2, "0")
  return new Promise((resolve,reject) => {
    try {
      fetch(`${self.config.apiBase}/v2/time_entries?`+ new URLSearchParams(
        {
          'user_id': self.config.userId,
          'is_running': true
        }),
        {
          method: 'get',
          headers: {
            'Authorization': `Bearer ${self.config.token}`,
            'Harvest-Account-ID': self.config.accountId,
            'User-agent': 'Companion Timesheets (tstpierre@ting.com)'
          }
        }
      ) 
      .then( res => {
        if (res.ok){
          self.updateStatus(InstanceStatus.Ok)
          res.json()
          .then(data => {
            // Do things here
            self.log('debug',`json response from time_entries is ${JSON.stringify(data)}`)

            if (data.time_entries.length == 1){
                self.log('debug','Timer is running')
                const entry = data.time_entries[0]
                isRunning = true
                timerId = entry.id
                self.setVariableValues({
                  ['currentProjectCode']: entry.project.code, 
                  ['currentProjectName']: entry.project.name,
                  ['currentProjectId']: entry.project.id,
                  ['currentTaskName']: entry.task.name,
                  ['currentTaskId']: entry.task.id,
                  ['currentTaskTime']: entry.task.hours,
                  ['timerRunning']: true,
                  ['timerId']: entry.id,
                  ['timerHours']: entry.hours
                })
            } else {
              self.setVariableValues({
                ['timerRunning']: false
              })
            }
            resolve({timerId: timerId, isRunning: isRunning})
          })
          self.checkFeedbacks('TimerRunning')
        } else {
            self.log('error',res.statusText)
            self.updateStatus(InstanceStatus.BadConfig)
          reject(res.statusText)
        }
      })
    } catch (err){
      reject(err)
      self.log('error',`GET error was ${err.text}`)
    }
  })
}

export function setTimer(self,id,run){
  try {
    let url = `${self.config.apiBase}/v2/time_entries/${id}`
    if (run){
      url = url + '/restart'
      self.log('info','Restarting timer')
    } else {
      url = url + '/stop'
      self.log('info','Stopping timer')
    }
    self.log('debug',`Set timer URL is ${url}`)
    fetch(url,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${self.config.token}`,
          'Harvest-Account-ID': self.config.accountId,
          'User-agent': 'Companion Timesheets (tstpierre@ting.com)',
          'Content-Type': 'Application/json; charset=utf-8'
        },
        body: '{}'
      }
    ) 
    .then( res => {
      if (res.ok){
        self.updateStatus(InstanceStatus.Ok)
        res.json()
        .then( entry => {
          self.log('debug',`json response from setting is ${JSON.stringify(entry)}`)
          
          self.setVariableValues({
            ['currentProjectCode']: entry.project.code, 
            ['currentProjectName']: entry.project.name,
            ['currentProjectId']: entry.project.id,
            ['currentTaskName']: entry.task.name,
            ['currentTaskId']: entry.task.id,
            ['currentTaskTime']: entry.task.hours,
            ['timerRunning']: run,
            ['timerId']: entry.id,
            ['timerHours']: entry.hours
          })
          self.checkFeedbacks()
        })
      } else {
        res.text()
        .then(text => {
          self.log('error',text)
        })
      }
      self.checkFeedbacks('TimerRunning')
    })
  } catch (err){
    self.log('error',`GET error was ${err.text}`)
    self.updateStatus(InstanceStatus.BadConfig)
  } 
}

export function startTask(self,project,task,notes){
  let url = `${self.config.apiBase}/v2/time_entries`
  const date = new Date
  const body = {
        project_id: project,
        task_id: task,
        spent_date: date.toISOString(),
        notes: notes,
      }

  self.log('debug',`Post body is ${JSON.stringify(body)}`)
  try {
    self.log('debug',`New task URL is ${url}`)

    fetch(url,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${self.config.token}`,
          'Harvest-Account-ID': self.config.accountId,
          'User-agent': 'Companion Timesheets (tstpierre@ting.com)',
          'Content-Type': 'Application/json; charset=utf-8'
        },
        body: JSON.stringify(body),
      }
    ) 
    .then( res => {
      if (res.ok){
        self.updateStatus(InstanceStatus.Ok)
        res.json()
        .then( entry => {
          self.log('debug',`json response from new task is ${JSON.stringify(entry)}`)
          
          self.setVariableValues({
            ['currentProjectCode']: entry.project.code, 
            ['currentProjectName']: entry.project.name,
            ['currentProjectId']: entry.project.id,
            ['currentTaskName']: entry.task.name,
            ['currentTaskId']: entry.task.id,
            ['currentTaskTime']: entry.task.hours,
            ['timerRunning']: true,
            ['timerId']: entry.id,
            ['timerHours']: entry.hours
          })
          self.checkFeedbacks()
        })
      } else {
        res.text()
        .then(text => {
          self.log('error',text)
        })
      }
      self.checkFeedbacks()
    })
  } catch (err){
    self.log('error',JSON.stringify(err))
    self.log('error',`POST error was ${err.text}`)
    self.updateStatus(InstanceStatus.BadConfig)
  }  
}

export function getProjects (self) {
  const projects = []//new Map
  const tasks = []//new Map
  return new Promise((resolve,reject) => {
    try {
      let url = `${self.config.apiBase}/v2/users/me/project_assignments?is_active=true`
      self.log('debug',`Get projects URL is ${url}`)
      fetch(url,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${self.config.token}`,
            'Harvest-Account-ID': self.config.accountId,
            'User-agent': 'Companion Timesheets (tstpierre@ting.com)',
            'Content-Type': 'Application/json; charset=utf-8'
          }
        }
      ) 
      .then( res => {
        if (res.ok){
          self.updateStatus(InstanceStatus.Ok)
          res.json()
          .then( data => {
            
            let assignment = {}
            for (assignment of data.project_assignments){
              
              let project = {
                id: assignment.project.id,
                name: assignment.project.name,
                code: assignment.project.code,
                tasks: []
              }
              let task = {}
              for (task of assignment.task_assignments){
                project.tasks.push(task.task)
//                tasks[task.task.id] = task.task.name
                tasks.push(task.task)
              }

//              projects[assignment.project.id] = project
              projects.push(project)
            }
//            self.log('info',`Projects is ${JSON.stringify(projects)}`)
            resolve({projects: projects, tasks: tasks})
          })
        } else {
          res.text()
          .then((text) => {
            reject(`Error from get projects ${text}`)
          })
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

export function getProjectTimer(self,project,task){
  let isRunning = false // We will return this 
  let timerId = 0
  const date = new Date()
  const dateToday = date.getFullYear()+'-'+(date.getMonth()+1).toString().padStart(2, "0")+'-'+date.getDate().toString().padStart(2, "0")
  return new Promise((resolve,reject) => {
    try {
      fetch(`${self.config.apiBase}/v2/time_entries?`+ new URLSearchParams(
        {
          'user_id': self.config.userId,
          'project_id': project,
          'task_id': task,
          'from': dateToday,
        }),
        {
          method: 'get',
          headers: {
            'Authorization': `Bearer ${self.config.token}`,
            'Harvest-Account-ID': self.config.accountId,
            'User-agent': 'Companion Timesheets (tstpierre@ting.com)'
          }
        }
      ) 
      .then( res => {
        if (res.ok){
          self.updateStatus(InstanceStatus.Ok)
          res.json()
          .then(data => {
            // Do things here
            self.log('debug',`json response from project time_entries is ${JSON.stringify(data)}`)
            let results = {
              timerId: 0, 
              isRunning: false,
            }
            if (data.time_entries.length > 0){
                const entry = data.time_entries[data.time_entries.length-1]
                results.timerId = entry.id
            } 
            resolve(results)
          })
          self.checkFeedbacks('TimerRunning')
        } else {
            self.log('error',res.statusText)
            self.updateStatus(InstanceStatus.BadConfig)
          reject(res.statusText)
        }
      })
    } catch (err){
      reject(err)
      self.log('error',`GET error was ${err.text}`)
    }
  })
}