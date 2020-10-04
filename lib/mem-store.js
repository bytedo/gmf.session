/**
 * 内存版会话管理(仅用于测试,数据)
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/18 16:35:26
 */

import fs from 'fs'

export default class Session {
  constructor(opt) {
    this.store = Object.create(null)
    this.ttl = opt.ttl
  }

  start(ssid) {
    var session = this.store[ssid]

    // 内存版会话管理, 没有设计计划任务来清理过期数据
    // 需要在初始化时先判断, 过期的自动清除, 没过期的, 直接重新续期
    if (session) {
      if (Date.now() > session.__expires__) {
        this.clear(ssid)
      }
    } else {
      session = this.store[ssid] = {}
    }

    // 设置session有效期
    session.__expires__ = Date.now() + this.ttl * 1000
  }

  // 获取session字段值
  get(ssid, key) {
    return key ? this.store[ssid][key] || null : this.store[ssid]
  }

  // 设置session字段值
  set(ssid, key, val) {
    if (typeof key === 'object') {
      for (let i in key) {
        this.store[ssid][i] = key[i]
      }
    } else {
      this.store[ssid][key] = val
    }
  }

  // 删除单个字段
  unset(ssid, key) {
    delete this.store[ssid][key]
  }

  // 清除个人session
  clear(ssid) {
    this.store[ssid] = {}
  }
}
