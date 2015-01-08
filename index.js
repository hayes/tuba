var Transform = require('stream').Transform
var whitesapce = ' \xA0\uFEFF\f\n\r\t\v​\u00a0\u1680​\u180e\u2000​\u2001' +
  '\u2002​\u2003\u2004\u2005\u2006​\u2007\u2008​\u2009\u200a​\u2028\u2029​' +
  '\u202f\u205f​\u3000'.split('').map(function(chr) {
    return chr.charCodeAt(0)
  })

Tuba.prototype = Object.create(Transform.prototype)

function Tuba(options) {
  if(!(this instanceof Tuba)) {
    return new Tuba(options)
  }

  Transform.call(this, options)
  this.parser = defaultParser
  this.prev = null
  this.matched = null
  this.current = null
}

Tuba.prototype._transform = function(chunk, encoding, done) {
  var offset = 0
  if(this.prev) {
    offset = this.prev.length
    this.prev = null
    buf = Buffer.concat(this.prev, chunk)
  }
  this.parser(buf, offset, done)
}

function defaultParser(buf, start, done) {
  for(var i = start, l = buf.length - 1; i < l; ++i) {
    // i === '<' and i+1 === '/|a-z|A-Z'
    if(buf[i] === 60 && (buf[i + 1] === 47 || (buf[i + 1] > 96 && buf[i + 1] < 123) || (buf[i + 1] > 59 && buf[i + 1] < 91))) break
  }

  if(i === l) {
    this.prev = this.buf
    return done()
  }

  if(i > 0) {
    this.push({type: text, value: buf.slice(0, i)})
  }

  this.parser = tagParser
  this.parser(buf, i, done)
}

function tagParser(buf, start, done) {
  for(var i = start + 1, l = buf.length; i < l; ++i) {
    if(whitesapce.indexOf(buf[i]) !== -1) break
  }

  if(i === l) {
    this.prev = this.buf
    return done()
  }
  // first === '/'
  if(buf[start + 1] === 47) {
    this.push({type: 'close', value: buf.slice(0, i)})
    // until '>'
    this.parser = consume(defaultParser, 62)
  } else {
    this.push({type: 'open', value: buf.slice(0, i)})
    this.parser = whitesapce(attributeParser)
  }

  this.parser(buf.slice(i, start, done)
}

function whitespace(parser) {
  return function(buf, start, done) {
    for(var l = buf.length; start < l; ++start) {
      if(whitesapce.indexOf(buf[start]) !== -1) break
    }

    if(start === l) done()
    this.parser = parser
    this.parser(buf.slice(start), 0, done)
  }
}

function consume(parser, end) {
  return function(buf, start, done) {
    for(var l = buf.length; start < l; ++start) {
      if(buf[i] === end) break
    }

    if(start === l) done()
    this.parser = parser
    this.parser(buf.slice(start + 1), 0, done)
  }
}

function attributeParser(buf, start, done) {
  // >
  if(buf[start]) === 62) {
    this.parser = defaultParser
    return this.parser(buf, start + 1, done)
  }

  for(var i = start + 1; l = buf.length; start < l; ++start) {
    var chr = buf[i]
    // chr === '=' or chr = '>' whitespace
    if(chr === 61 || chr === 62 || whitesapce.indexOf(chr) !== -1) break
  }

  if(i === l) {
    this.prev = this.buf
    return done()
  }

  if(buf[i] === 62) {
    this.parser = defaultParser
    return this.parser(buf, start + 1, done)
  }

}
