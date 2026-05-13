// User data helper utilities for profile and session management

const serialize = require('node-serialize') // CVE-2017-5941 - RCE via deserialization
const exec = require('child_process').exec

// SAST: Command injection - user-controlled input passed directly to exec
function generateUserReport (username) {
  exec('generate-report --user ' + username, (err, stdout) => {
    if (err) console.error(err)
    console.log(stdout)
  })
}

// SAST: Unsafe deserialization - attacker-controlled data deserialized directly
function restoreUserSession (serializedSession) {
  return serialize.unserialize(serializedSession)
}

module.exports = { generateUserReport, restoreUserSession }
