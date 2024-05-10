import { combineRgb } from '@companion-module/base'
import {
  checkTimer,
  getItems,
} from './api.js'

export function feedbackDefinitions(self) {
  self.setFeedbackDefinitions({
    TimerRunning: {
      name: 'Timer is running',
      type: 'boolean',
      label: 'Running',
      defaultStyle: {
        bgcolor: combineRgb(0,204,0),
        color: combineRgb(255,255,255),
      },
      callback: async (feedback,context) => {
        return self.getVariableValue('timerRunning')
      }
    },
    TaskRunning: {
      name: 'Specific task is running',
      type: 'boolean',
      label:' Task running',
      defaultStyle: {
        bgcolor: combineRgb(0,204,0),
        color: combineRgb(255,255,255),
      },
      options: [
        {
          type: 'textinput',
          label: 'Project ID',
          id: 'projectId'
        },{
          type: 'textinput',
          label: 'Task ID',
          id: 'taskId'
        }
      ],
      callback: async(feedback, context) => {
        if (!self.getVariableValue('timerRunning')) {
          return false
        }
        const currentProject = self.getVariableValue('currentProjectId')
        const currentTask = self.getVariableValue('currentTaskId')
        if (currentProject == feedback.options.projectId && currentTask == feedback.options.taskId) {
          return true
        } else if (feedback.options.projectId == "" && currentTask == feedback.options.taskId){
          return true
        } else if (feedback.options.projectId == currentProject && feedback.options.taskID == ""){
          return true
        } else {
          return false
        }
      }
    }
  })
  self.feedbackTimers['CheckTimer'] = {
    name: 'CheckTimer',
    timer: setInterval(checkTimer,600000,self)
  }
}



