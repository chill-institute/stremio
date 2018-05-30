const PutioClient = require('@putdotio/api-client')
const config = require('../app-config')

class Putio extends PutioClient.default {
  async getOrCreateTargetFolderIfNeeded() {
    let targetFolder

    try {
      const { data: { files } } = await this.Files.Query(0)
      targetFolder = files.find(file => file.name === config.putio.folderName)
    } catch (error) {
      throw error
    }

    if (!targetFolder) {
      try {
        const { data: { file } } = await this.Files.NewFolder(config.putio.folderName)
        targetFolder = file
      } catch (error) {
        throw error
      }
    }

    return targetFolder
  }
}

module.exports = new Putio({
  clientID: config.putio.clientID,
  isomorphic: true,
})

