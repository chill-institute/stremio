class DB {
  constructor() {
    this.users = {} // { token: user_id }
    this.userTransfers = {} // { user_id: { imdb_id: user_file_id } }
    this.torrents = {} // { imdb_id: torrent }
    this.locks = {}
  }

  getUser({ token }) {
    return this.users[token]
  }

  setUser({ token, userId }) {
    this.users[token] = userId
    return userId
  }

  getTorrent({ imdbId }) {
    return this.torrents[imdbId]
  }

  setTorrent({ imdbId, torrent }) {
    this.torrents[imdbId] = torrent
    return torrent
  }

  getTransfer({ token, userId, imdbId }) {
    if (token) {
      userId = this.getUser({ token })
    }

    if (!this.userTransfers[userId]) {
      this.userTransfers[userId] = {}
    }

    return this.userTransfers[userId][imdbId]
  }

  setTransfer({ token, userId, imdbId, fileId }) {
    if (token) {
      userId = this.getUser({ token })
    }

    if (!this.userTransfers[userId]) {
      this.userTransfers[userId] = {}
    }

    this.userTransfers[userId][imdbId] = fileId

    return fileId
  }

  getLock({ token, key }) {
    if (!this.locks[token]) {
      this.locks[token] = {}
    }

    return this.locks[token][key]
  }

  setLock({ token, key }) {
    if (!this.locks[token]) {
      this.locks[token] = {}
    }

    this.locks[token][key] = true

    return this.locks
  }

  removeLock({ token, key }) {
    delete this.locks[token][key]

    return this.locks
  }
}

module.exports = new DB()

