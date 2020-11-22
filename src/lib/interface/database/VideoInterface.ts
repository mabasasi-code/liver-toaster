
export default interface VideoInterface {
  _id?: number

  videoId: string
  title: string
  channelId: string
  channelTitle: string
  scheduledStartTime?: string // "2020-11-21T21:30:00Z"
  scheduledEndTime?: string
  actualStartTime?: string
  actualEndTime?: string

  notifySchedule: boolean
  notifyStart: boolean
  notifyEnd: boolean

  createdAt?: Date
  updatedAt?: Date
}
