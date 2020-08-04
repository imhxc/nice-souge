const { log } =  console
const names = require('./lib/names') // 拼接歌曲名称
const EventEmitter = require('events')

class Emitter extends EventEmitter {}

const emitter = new Emitter()

  ;[
    'search',
    'choose',
    'find',
    'download'
  ].forEach(key => {
    // 家在 search/choose/find/download 四个模块的方法
    const fn = require(`./lib/${key}`)
    // 为 emitter 增加 4 个事件监听，key 就是模块名称
    emitter.on(key, async function (...args) {
      const res = await fn(...args)
      this.emit('handler', key, res, ...args)
    })
  })

  // 搜索后触发 afterSearch，它回调里面继续除阿方 choose 事件
  emitter.on('afterSearch',  function (data, q) {
    if (!data || !data.result || !data.result.songs) {
      log('没搜到  ${q} 的相关结果.')
      return process.exit(1)
    }
    const { songs } = data.result
    this.emit('choose', songs)
  })

  // 在歌曲被选中后，它回调里面继续触发 find 事件
  emitter.on('afterChoose', function (answers, songs) {
    const arr = songs.filter((song, i) => (
      names(song, i) === answers.song
    ))

    if (arr[0] && arr[0].id) {
      this.emit('find', arr[0], answers.song)
    }
  })

  // 在歌曲被找到后，在它的回调里面触发下载事件
  emitter.on('afterFind', function ({ song, res, findName }) {
    if (res[0] && res[0].url) {
      this.emit('download', { song, res: res[0], findName })
    }
  })

  // 收到下载结束，退出程序
  emitter.on('downloadEnd', function () {
    log('下载结束.')
    process.exit()
  })

  // 这里的 handler 精简了多个事件的判断
  // 为不同的事件增加了不同的触发回调
  emitter.on('handler', function (key, res, ...args) {
    switch (key) {
      case 'search':
        return this.emit('afterSearch', res, args[0])
      case 'choose':
        return this.emit('afterChoose', res, args[0])
      case 'find':
        return this.emit('afterFind', res)
      case 'download':
        return this.emit('downloadEnd', res)
    }
  })

  module.exports = emitter