import { combineRgb } from '@companion-module/base'

export function initPresets(self,projects,tasks) {
  self.log('info','Started init presets function')
//  self.log('info',`Projects is ${JSON.stringify(projects)}`)
  const presets = {}
  try {
    let project = {}
    for (let project of projects.values()){
//      self.log('info',`Iterating over project ${project}`)
      for (let task of project.tasks){
//        self.log('info',`project${project.id}task${task.id}`)
        presets[`project${project.id}task${task.id}`] = {
          type: 'button',
          category: `Project ${project.name}`,
          name: `${project.name} ${task.name}`,
          style: {
            text: `${project.name.substring(0,10)} ${task.name}`,
            size: 'auto',
            color: combineRgb(255,255,255),
            bgcolor: combineRgb(0,0,0),
          },
          steps: [{
            down: [
              {
                actionId: 'startTask',
                options: {
                  project: project.id,
                  task: task.id,
                  notes: '',
                }
              }
            ],
            up: [],
          }],
          feedbacks: [{
            feedbackId: 'TaskRunning',
            options: {
              projectId: project.id,
              taskId: task.id,
            },
            style: {
              bgcolor: combineRgb(0,204,0)
            }
          }],
        }
      }
    } 
    return presets
  } catch (err) {
    self.log('error',err)
  }
}