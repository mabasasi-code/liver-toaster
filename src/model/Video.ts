import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import YoutubeVideoInterface from '../interface/youtube/YoutubeVideoInterface';
import SoftDeleteModel from './SoftDeleteModel';

@Entity('videos')
export default class Video extends SoftDeleteModel {
    @PrimaryGeneratedColumn()
    readonly id: number

    @Column('text')
    videoId: string

    @Column('text')
    title: string

    @Column('text')
    channelId: string

    @Column('text')
    channelTitle: string

    @Column('text', { nullable: true })
    thumbnailUrl?: string

    @Column('datetime', { nullable: true })
    publishedAt?: Date

    @Column('datetime', { nullable: true })
    scheduledStartTime?: Date

    @Column('datetime', { nullable: true })
    scheduledEndTime?: Date

    @Column('datetime', { nullable: true })
    actualStartTime?: Date

    @Column('datetime', { nullable: true })
    actualEndTime?: Date

    @Column('boolean', { default: false })
    isMemberOnly: boolean

    ///
    // parameter

    @Column('text', { nullable: true })
    scheduleTweetId?: string

    @Column('text', { nullable: true })
    startTweetId?: string

    @Column('text', { nullable: true })
    endTweetId?: string // '0' はダミー終了

    ///

    @CreateDateColumn()
    readonly createdAt: Date

    @UpdateDateColumn()
    readonly updatedAt: Date

    /// ////////////////////////////////////////////////////////////
    // get

    public url(defaultValue: any = null) {
      return this.videoId
        ? 'https://youtu.be/' + this.videoId
        : defaultValue
    }

    ///
    // function

    public assignAPI(api?: YoutubeVideoInterface) {
      if (api) {
        this.videoId = this.videoId || this.get(api, 'id') // 値があったら更新させない
        this.title = this.get(api, 'snippet.title')
        this.channelId = this.get(api, 'snippet.channelId')
        this.channelTitle = this.get(api, 'snippet.channelTitle')

        this.publishedAt = this.getToDate(api, 'snippet.publishedAt')
        this.scheduledStartTime = this.getToDate(api, 'liveStreamingDetails.scheduledStartTime')
        this.actualStartTime = this.getToDate(api, 'liveStreamingDetails.actualStartTime')
        this.actualEndTime = this.getToDate(api, 'liveStreamingDetails.actualEndTime')

        this.thumbnailUrl = this.getReqursion(api,
          'snippet.thumbnails.maxres.url',
          'snippet.thumbnails.standard.url',
          'snippet.thumbnails.high.url',
          'snippet.thumbnails.medium.url',
          'snippet.thumbnails.default.url',
        )

        // 再生数が取れないならメン限
        this.isMemberOnly = !Boolean(this.get(api, 'statistics.viewCount'))
      }
    }
}
