/**
 * 会话模块
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/24 11:18:23
 */

import { uuid, sha1 } from 'crypto.js'

import RedisStore from './lib/redis-store.js'

// 会话安装包
export const sessionPackage = {
  name: 'session',
  install() {
    var session = this.get('session')
    // 这里只创建session的存储器, 而初始化操作在中间件中进行
    return new RedisStore(session)
  }
}

// 会话中间件
export function sessionConnect(req, res, next) {
  var opt = this.get('session')
  var cache = req.cookie('NODESSID')
  var deviceID = ''
  var ssid

  // options请求不处理会话
  if (req.method === 'OPTIONS') {
    return next()
  }

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

  res.cookie('NODESSID', ssid, { maxAge: opt.ttl, domain: opt.domain })
  // 缓存ssid到req上
  req.ssid = ssid
  this.$$session.start(ssid)

  next()
}
