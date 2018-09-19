'use strict'

var test = require('tape')
var prop = require('@yoda/property')
var helper = require('../helper')
var login = require(`${helper.paths.runtime}/lib/cloudapi/login`)

test.skip('login', function (t) {
  t.plan(4)
  login().then((data) => {
    t.equal(data.deviceId, prop.get('ro.boot.serialno'), 'the login device id is checked')
    t.equal(typeof data.deviceTypeId, 'string', 'the login device type id is checked')
    t.equal(typeof data.key, 'string', 'the login key is checked')
    t.equal(typeof data.secret, 'string', 'the login secret is checked')
    t.end()
  })
})
