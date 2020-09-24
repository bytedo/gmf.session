/**
 * 会话模块
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/24 11:18:23
 */

import { uuid, sha1 } from 'crypto.js'

import RedisStore from './lib/redis-store.js'
import MemStore from './lib/mem-store.js'

// 会话储存器
export const sessionStore = {
  name: 'session',
  install() {
    var session = this.get('session')

    // 这里只创建session的存储器, 而初始化操作在中间件中进行
    if (session.type === 'redis') {
      return new RedisStore(session)
    } else {
      return new MemStore(session)
    }
  }
}

// 会话中间件
export function sessionWare(req, res, next) {
  var opt = this.get('session')
  var jwt = this.get('jwt')
  var ssid

  // options请求不处理会话
  if (req.method === 'OPTIONS') {
    return next()
  }

  // jwt模式的校验不在这里处理
  if (jwt) {
    var auth = req.header('authorization')
    if (auth) {
      ssid = auth.split('.').pop()
      this.$$session.start(ssid)
    }
  } else {
    var cache = req.cookie('NODESSID')
    var deviceID = ''

    // 校验UA
    if (opt.level & 2) {
      deviceID += req.header('user-agent')
    }

    // 校验IP
    if (opt.level & 4) {
      deviceID += req.ip()
    }

    if (deviceID) {
      deviceID = sha1(deviceID)

      // ssid 最后16位是指纹
      if (cache) {
        if (cache.slice(-16) === deviceID.slice(-16)) {
          ssid = cache
        } else {
          ssid = uuid('') + deviceID.slice(-16)
        }
      }
    } else {
      ssid = cache || sha1(uuid())
    }

    res.cookie('NODESSID', ssid)
    this.$$session.start(ssid)
  }

  next()
}
