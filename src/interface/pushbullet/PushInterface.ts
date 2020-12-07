
export default interface PushInterface {
  type: string
  source_device_iden: string
  source_user_iden: string
  client_version: number
  dismissible: boolean
  icon: string
  title: string
  body: string
  application_name: string
  package_name: string
  notification_id?: string
  notification_tag?: string
  action?: {
    label: string
    trigger_key: string
  }[]
}
