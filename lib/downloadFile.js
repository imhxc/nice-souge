const fs = require('fs')
const path = require('path')
const https = require('https')

module.exports = async (args) => {
  const { type, name, url, size } = args

  await new Promise((resolve) => {
    https.get(url, (res) => {

      const total = res.headers[ 'content-length' ] / (1024 * 1024).toFixed(2)

      let data;
      const basePath = path.join(process.cwd(), './music');
      const fullPath = `${basePath}/${name}.${type}`

      // 如果无目标文件，则自动创建
      if (!fs.existsSync(basePath)) {
        fs.mkdirSync(basePath)
      }
      if (fs.existsSync(fullPath)) {
        console.log('已经存在该文件，跳过下载.')
        resolve()
        return
      }
      res.pipe(fs.createWriteStream(fullPath))

      res.on('data', (chunk) => {
        data += chunk
        const tickNum = (data.length / (1014 * 1014)).toFixed(2)
        console.log(`正在下载中，进度：${(tickNum / total).toFixed(2) * 100}%`)
      })
      res.on('end', () => {
        resolve('end')
        console.log('Bingo🎉，下载完成，进度 100%。')
      })
    })
  })
}