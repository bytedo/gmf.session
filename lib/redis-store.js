/**
 * redis版会话管理
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/18 16:35:26
 */

import Ioredis from 'ioredis'

export default class Session {
  constructor(opt) {
    this.store = new Ioredis({
      host: opt.db.host || '127.0.0.1',
      port: opt.db.port || 6379,
      db: opt.db.db || 0
    })
    this.ttl = opt.ttl
  }

  start(ssid) {
    // 设置session有效期
    this.store.expire(ssid, this.ttl)
  }

  // 获取session字段值, 需要await指令
  get(ssid, key) {
    var defer = Promise.defer()

    this.store.hgetall(ssid, (err, obj) => {
      if (err) {
        return defer.reject(err)
      }

      for (let i in obj) {
        if (obj[i]) {
          obj[i] = Number.parse(obj[i])
        }
      }
      //不传key时,直接返回全部字段
      if (key) {
        defer.resolve(obj.hasOwnProperty(key) ? obj[key] : null)
      } else {
        defer.resolve(obj)
      }
    })
    return defer.promise
  }

  //设置session字段值
  set(ssid, key, val) {
    if (typeof key === 'object') {
      for (let i in key) {
        this.store.hset(ssid, i, key[i])
      }
    } else {
      this.store.hset(ssid, key, val)
    }
  }

  //删除单个字段
  unset(ssid, key) {
    this.store.hdel(ssid, key)
  }

  //清除个人session
  clear(ssid) {
    this.store.del(ssid)
  }
}
