/**
 * 内存版会话管理(仅用于测试,数据)
 * @author yutent<yutent.io@gmail.com>
 * @date 2020/09/18 16:35:26
 */

function hideProperty(host, name, value) {
  Object.defineProperty(host, name, {
    value: value,
    writable: true,
    enumerable: false,
    configurable: true
  })
}

export default class Session {
  constructor(opt) {
    this.store = Object.create(null)
    this.ttl = opt.ttl
  }

  start(ssid, oldssid) {
    var session = this.store[ssid]

    this.ssid = ssid

    // 内存版会话管理, 没有设计计划任务来清理过期数据
    // 需要在初始化时先判断, 过期的自动清除, 没过期的, 直接重新续期
    if (session) {
      if (Date.now() > session.__expires__) {
        this.clear()
      }
    } else {
      session = this.store[ssid] = {}
    }

    // 设置session有效期
    hideProperty(session, '__expires__', Date.now() + this.ttl * 1000)
  }

  // 获取session字段值
  get(key) {
    return key ? this.store[this.ssid][key] || null : this.store[this.ssid]
  }

  // 设置session字段值
  set(key, val) {
    if (typeof key === 'object') {
      for (let i in key) {
        this.store[this.ssid][i] = key[i]
      }
    } else {
      this.store[this.ssid][key] = val
    }
  }

  // 删除单个字段
  unset(key) {
    delete this.store[this.ssid][key]
  }

  // 清除个人session
  clear() {
    this.store[this.ssid] = {}
  }
}
