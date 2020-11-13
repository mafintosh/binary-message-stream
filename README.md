# binary-message-stream

Simple duplex stream that allows you to send messages, including binary messages.

```
npm install binary-message-stream
```

## Usage

``` js
const Messenger = require('binary-message-stream')

const a = new Messenger()
const b = new Messenger()

a.pipe(b).pipe(a)

a.send('hi')
a.send(Buffer.alloc(2))
a.send({ yes: Buffer.from('yes') })

b.on('message', function (message) {
  // prints:
  // 'hi'
  // <Buffer 00 00>
  // { yes: <Buffer 79 65 73> }
  console.log(message)
})
```

## License

MIT
