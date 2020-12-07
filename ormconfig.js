
module.exports = {
  type: 'sqlite',
  database: process.env.DATABASE_PATH || './storage/database.sqlite',
  synchronize: true,
  logging: false,
  debug: false,
  entities: [
    'src/model/**/*.ts'
  ],
  subscribers: [
    'src/subscriber/**/*.ts'
  ]
  // migrations: [
  //   'database/migration/**/*.ts'
  // ],
}
