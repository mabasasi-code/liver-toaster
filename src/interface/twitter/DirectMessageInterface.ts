import TwitterEntityInterface from './TwitterEntityInterface'

export default interface DirectMessageInterface {
  type: 'message_create'
  id: string // id_str と同一
  created_timestamp: string // "1608358061004"
  message_create?: {
    target: {
      recipient_id: string // 送信先 user id
    }
    sender_id: string // 送信元 user id
    message_data: {
      text: string
      entities?: TwitterEntityInterface
    }
  }
}
