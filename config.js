export const configFields = [
  {
    id: 'token',
    type: 'textinput',
    label: 'Authorization token',
    width: 64
  },
  {
    id: 'accountId',
    type: 'textinput',
    label: 'Harvest Account ID',
    width: 64
  },
  {
    id: 'userId',
    type: 'textinput',
    label: 'Harvest User ID',
    width: 64
  },
  {
    id: 'apiBase',
    type: 'textinput',
    label: 'API Base URL',
    width: 64,
    default: 'https://api.harvestapp.com'
  }
]