const borc = require('borc')
const streamx = require('streamx')

module.exports = class Messenger extends streamx.Duplex {
  constructor () {
    super()

    this.missing = 3
    this.state = 0
    this.buffer = null
  }

  _write (data, cb) {
    while (data.length && !this.destroying) {
      if (this.buffer) {
        const offset = this.buffer.length - this.missing
        data.copy(this.buffer, offset)
        if (data.length >= this.missing) {
          data = data.slice(this.missing)
          this.missing = 0
        } else {
          this.missing -= data.length
        }
      } else {
        if (this.missing <= data.length) {
          this.buffer = data.slice(0, this.missing)
          data = data.slice(this.missing)
          this.missing = 0
        } else {
          this.buffer = Buffer.allocUnsafe(this.missing)
          continue
        }
      }

      if (this.missing !== 0) return cb(null)

      if (this.state === 0) {
        this.state = 1
        this.missing = this.buffer[0] + 256 * this.buffer[1] + 65536 * this.buffer[2]
        this.buffer = null
      } else {
        let message
        try {
          message = borc.decodeFirst(this.buffer)
        } catch (err) {
          return cb(err)
        }

        this.state = 0
        this.missing = 3
        this.buffer = null
        this.emit('message', message)
      }
    }

    cb(null)
  }

  send (msg) {
    const header = Buffer.alloc(3)
    const buf = borc.encode(msg)
    header[0] = buf.length & 0x0000ff
    header[1] = (buf.length & 0x00ff00) >>> 8
    header[2] = (buf.length & 0xff0000) >>> 16
    this.push(Buffer.concat([header, buf]))
  }
}
