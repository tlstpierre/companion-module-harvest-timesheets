import {
  InstanceBase,
  runEntrypoint,
  InstanceStatus,
  //CompanionFeedbackDefinitions,
//  CompanionFeedbackDefinition,
  combineRgb
  
} from '@companion-module/base'
import { UpgradeScripts } from './upgrade.js'
import { configFields } from'./config.js'
import { variableDefinitions } from './variables.js'
import { initActions } from './actions.js'
import { feedbackDefinitions } from './feedback.js'
import { initPresets } from './presets.js'

import {
  getItems,
  getProjects,
} from './api.js'


class HarvestTimesheetsInstance extends InstanceBase {
  configUpdated(config){
    this.log('info','Running configUpdated')
    this.config = config
    this.initVariables()
    getItems(this)
    this.initActions()
    this.initFeedbacks()
    this.initPresets()

  }
  
  init(config){
    this.log('info','Running init config')
    this.config = config
    this.initVariables()
    getItems(this)
    this.initActions()
    this.initFeedbacks()
    this.initPresets()
}
  
  getConfigFields(){
    return configFields
  }
  
  async destroy(){
    // Stop any running feedback timers
    for (const timer of Object.values(this.feedbackTimers)) {
        clearInterval(timer)
    }
  }
  
  initActions(){
     initActions(this)
  }
  
	feedbackTimers = {}
  
  initFeedbacks(){
    feedbackDefinitions(this)
  }
  
  projects = []
  tasks = []
  
  initPresets(){
    this.log('info','Presets init')
    getProjects(this)
    .then((projectlist) => {
      this.projects = projectlist.projects
      this.tasks = projectlist.tasks
      this.log('info','Got Projects')
      const presets = initPresets(this,projectlist.projects,projectlist.tasks)
      this.log('info','Done presets init')
      this.setPresetDefinitions(presets)
      this.log('info','Set preset definitions')  
      
    })
  }
  
  initVariables(){
    variableDefinitions(this)
  }
  
  timeEntries = []
}
runEntrypoint(HarvestTimesheetsInstance,UpgradeScripts)