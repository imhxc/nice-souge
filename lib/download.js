const downloadFile = require('./downloadFile')

module.exports = async (args) => {
  const { res, findName } = args
  const { url } = res
  if (!url) {
    throw '暂未发现下载链接.'
  }
  await downloadFile({
    type: res.type,
    name: findName,
    url: res.url,
    size: res.size
  })
}