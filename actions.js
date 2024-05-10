import { FIELDS } from './fields.js'
import {
  InstanceStatus,
} from '@companion-module/base'
import {
  checkTimer,
  setTimer,
  getItems,
  startTask,
  getProjectTimer,
} from './api.js'

export function initActions(self){
  self.setActionDefinitions({
    stopTimer: {
      name: 'Stop Timer',
      callback: async(action,context) => {
        let isRunning = false
        let timerId = 0
        checkTimer(self)
        .then(timerStatus =>{
          self.log('info',`Timer id ${timerStatus.timerId} is running ${timerStatus.isRunning}, will stop if true`)
          if (timerStatus.isRunning) {
            setTimer(self,timerStatus.timerId,false)
          }
//        self.checkFeedbacks()
        })
      }
    },
    toggleTimer: {
      name: 'Toggle Timer',
      callback: async(action,context) => {
        let isRunning = false
        let timerId = 0
        checkTimer(self)
        .then(timerStatus =>{
          self.log('info',`Timer id ${timerStatus.timerId} is running ${timerStatus.isRunning}, toggling’`)
          if (timerStatus.isRunning) {
            setTimer(self,timerStatus.timerId,false)
          } else {
            timerId = self.getVariableValue('timerId')
            if (timerId > 0){
              setTimer(self,timerId,true)
            }
          }
        })
      }
    },
    startLastTimer: {
      name: 'Start Last Timer',
      callback: async(action,context) => {
        const running = self.getVariableValue('timerRunning')
        const id = self.getVariableValue('timerId')
        self.log('debug',`Acting on start - current timer is ${id} and state is ${running}`)
        if (id === undefined){
          checkTimer(self)
        }
        if (!running && id > 0){
          self.log('info','Timer was not running, will restart')
          const lastId = self.getVariableValue('timerId')
          setTimer(self,lastId,true)
        }
      }
    },
    refreshItems: {
      name: 'Refresh Item List',
      callback: async(action, context) => {
        getItems(self)
      }
    },
    startTask: {
      name: 'Start Specific Task',
      options: [FIELDS.Project,FIELDS.Task,FIELDS.Notes],
      callback: async(action, context) =>{
        self.log('info','Starting task')
          if (self.getVariableValue('timerRunning')) {
            setTimer(self,self.getVariableValue('currentTimer'),false)
          }
          getProjectTimer(self,action.options.project,action.options.task)
          .then((timerStatus) =>{
            if (timerStatus.timerId == 0){
              startTask(self,action.options.project,action.options.task,action.options.notes)
            } else {
              setTimer(self,timerStatus.timerId,true)              
            }
          })
      }
    }

  })
}