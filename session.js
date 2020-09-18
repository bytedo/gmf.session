/**
 *
 * @authors yutent (yutent@doui.cc)
 * @date    2018-07-26 15:50:25
 * @version $Id$
 */
import redisStore from './lib/redis-store.js'
import nativeStore from './lib/native-store.js'
import { uuid, sha1 } from 'crypto.js'

export default function(req, res, next) {
  var opt = this.get('session')
  var jwt = this.get('jwt')
  var cookie = this.ins('cookie')
  var session = null
  var deviceID = uuid()
  var ssid = ''

  opt.jwt = jwt

  if (req.method === 'OPTIONS') {
    return next()
  }

  if (jwt) {
    var auth = req.header('authorization')
    if (auth) {
      ssid = auth.split('.').pop()
      deviceID = auth
    }
  } else {
    ssid = cookie('NODESSID')
    // 校验级别为1, 则混入ua
    if (opt.level > 0) {
      deviceID += req.header('user-agent')
    }
    // 校验级别为2, 则混入ip
    if (opt.level > 1) {
      deviceID += req.ip()
    }
  }
  deviceID = sha1(deviceID)

  if (opt.type === 'redis') {
    session = new redisStore(this.__SESSION_STORE__, opt, deviceID)
  } else {
    session = new nativeStore(this.__SESSION_STORE__, opt, deviceID)
  }

  // 启用SESSION
  // ssid非法或过期时，需要重写
  if (!ssid || ssid !== session.start(ssid)) {
    ssid = session.start(ssid)
    if (!jwt) {
      cookie('NODESSID', ssid, {
        httpOnly: true,
        expires: opt.ttl,
        domain: opt.domain
      })
    }
  }

  this.__INSTANCE__.session = session

  next()
}
