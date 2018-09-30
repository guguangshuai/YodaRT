var logger = require('logger')('custodian')
var wifi = require('@yoda/wifi')

module.exports = Custodian
function Custodian (runtime) {
  wifi.enableScanPassively()
  this.runtime = runtime

  /**
   * set this._networkConnected = undefined at initial to
   * prevent discarding of very first of network disconnect event.
   */
  this._networkConnected = undefined
  /**
   * this._loggedIn could be used to determine if current session
   * is once connected to internet.
   */
  this._loggedIn = false
}

/**
 * Fires when the network is connected.
 * @private
 */
Custodian.prototype.onNetworkConnect = function onNetworkConnect () {
  if (this._networkConnected) {
    return
  }
  this._networkConnected = true
  logger.info('on network connect')

  this.runtime.reconnect()
}

/**
 * Fires when the network is disconnected.
 * @private
 */
Custodian.prototype.onNetworkDisconnect = function onNetworkDisconnect () {
  if (this._networkConnected === false) {
    return
  }
  this._networkConnected = false
  logger.info('on network disconnect, once logged in?', this._loggedIn)
  this.runtime.wormhole.setOffline()

  if (wifi.getNumOfHistory() > 0) {
    // waiting for user awake or button event in order to switch to network config
    logger.log('network switch, try to relogin, waiting for user awake or button event')
    return
  }
  logger.log('network disconnected, please connect to wifi first')
  this.runtime.openUrl('yoda-skill://network/setup', { preemptive: true })
}

Custodian.prototype.onLoggedIn = function onLoggedIn () {
  this._loggedIn = true
  logger.info('on logged in')
}

/**
 * Reset network and start procedure of configuring network.
 */
Custodian.prototype.resetNetwork = function resetNetwork () {
  logger.log('reset network')
  wifi.resetWifi()
  wifi.disableAll()
  this.runtime.wormhole.setOffline()

  this._networkConnected = false
  this._loggedIn = false
  this.runtime.openUrl('yoda-skill://network/setup', { preemptive: true })
}

Custodian.prototype.isPrepared = function isPrepared () {
  return this._networkConnected && this._loggedIn
}

Custodian.prototype.isNetworkUnavailable = function isNetworkUnavailable () {
  return !this._networkConnected && this._loggedIn
}

Custodian.prototype.isRegistering = function isRegistering () {
  return this._networkConnected && !this._loggedIn
}

Custodian.prototype.isConfiguringNetwork = function isConfiguringNetwork () {
  return !(this._networkConnected || this._loggedIn)
}

Custodian.prototype.prepareNetwork = function prepareNetwork () {
  if (wifi.getWifiState() === wifi.WIFI_CONNECTED) {
    return this.onNetworkConnect()
  }
  if (wifi.getNumOfHistory() > 0) {
    logger.info('has histroy wifi, just skip')
    return
  }
  return this.onNetworkDisconnect()
}
