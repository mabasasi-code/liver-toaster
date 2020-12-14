import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import YoutubeChannelInterface from '../interface/youtube/YoutubeChannelInterface';
import SoftDeleteModel from './SoftDeleteModel';

@Entity('channels')
export default class Channel extends SoftDeleteModel {
    @PrimaryGeneratedColumn()
    readonly id: number

    @Column('text')
    channelId: string

    @Column('text')
    title: string

    @Column('text', { nullable: true })
    thumbnailUrl?: string

    @Column('datetime', { nullable: true })
    publishedAt?: Date

    @Column('text', { nullable: true })
    playlist?: string

    @Column('integer', { default: 0 })
    viewCount: number

    @Column('integer', { default: 0 })
    subscriberCount: number

    @Column('integer', { default: 0 })
    videoCount: number

    @Column('boolean', { nullable: true, default: false })
    hiddenSubscriberCount?: boolean

    ///
    // parameter

    @Column('text', { nullable: true })
    latestPostId?: string

    @Column('text', { nullable: true })
    latestMemberPostId?: string

    ///

    @CreateDateColumn()
    readonly createdAt: Date

    @UpdateDateColumn()
    readonly updatedAt: Date

    /// ////////////////////////////////////////////////////////////
    // get

    public url(type: string = '', defaultValue: any = null) {
      const suffix = type ? '/' + type : ''
      return this.channelId
        ? 'https://www.youtube.com/channel/' + this.channelId + suffix
        : defaultValue
    }

    ///
    // function

    public assignAPI(api?: YoutubeChannelInterface) {
      if (api) {
        this.channelId = this.channelId || this.get(api, 'id') // 値があったら更新させない
        this.title = this.get(api, 'snippet.title')
        this.publishedAt = this.getToDate(api, 'snippet.publishedAt')
        this.playlist = this.get(api, 'contentDetails.relatedPlaylists.uploads')

        this.viewCount = this.getToNumber(api, 'statistics.viewCount')
        this.subscriberCount = this.getToNumber(api, 'statistics.subscriberCount')
        this.videoCount = this.getToNumber(api, 'statistics.videoCount')
        this.hiddenSubscriberCount = this.getToBoolean(api, 'statistics.hiddenSubscriberCount')

        this.thumbnailUrl = this.getReqursion(api,
          'snippet.thumbnails.high.url',
          'snippet.thumbnails.medium.url',
          'snippet.thumbnails.default.url',
        )
      }
    }
}
