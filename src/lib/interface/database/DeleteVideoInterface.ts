
export default interface DeleteVideoInterface {
  videoId: string
  deletedAt?: Date
  isDelete: boolean // delete 判定用キー (値は使ってない)
}
