const fs = require('fs')
const utils = require('@applitools/utils')

main({
  device: 'Pixel 3a XL',
  apiLevel: 29, // android 10
  port: 5555,
  jobs: process.env.MOCHA_JOBS ? Number(process.env.MOCHA_JOBS) : 1,
})

async function main({device, apiLevel, port, jobs}) {
  console.log('Accepting Android SDK licenses...')
  await utils.process.sh(`yes | sdkmanager --licenses`, {
    spawnOptions: {stdio: 'pipe'},
  })

  console.log('Installing dependencies...')
  await utils.process.sh(
    `sdkmanager --install 'emulator' 'cmdline-tools;latest' 'build-tools;29.0.3' 'platform-tools' 'platforms;android-${apiLevel}' 'system-images;android-${apiLevel};google_apis;x86_64'`,
    {spawnOptions: {stdio: 'pipe'}},
  )

  console.log('Running emulators...')
  const emulatorIds = await Promise.all(
    Array.from({length: jobs}, (_, index) => runEmulator({device, apiLevel, port, index})),
  )

  fs.writeFileSync('./.env', `ANDROID_EMULATOR_UDID=${emulatorIds.join(',')}\n`, {flag: 'a'})

  console.log('Done! All emulators are ready to use.')
}

async function runEmulator({device, apiLevel, port, index}) {
  const adbPort = port + index * 2
  const deviceName = device.toLowerCase().replace(/\s/g, '_')
  const avdName = `${deviceName}_${adbPort}`
  console.log(`Creating emulator with name "${avdName}"...`)
  await utils.process.sh(
    `avdmanager create avd --force --name ${avdName} --device ${deviceName} --package 'system-images;android-${apiLevel};google_apis;x86_64'`,
    {spawnOptions: {stdio: 'pipe'}},
  )

  console.log(`Running emulator with name "${avdName}"...`)
  await utils.process.sh(
    `emulator -noaudio -no-window -no-boot-anim -gpu swiftshader_indirect -ports ${adbPort},${adbPort +
      1} -avd ${avdName} &`,
    {spawnOptions: {detached: true, stdio: 'ignore'}},
  )

  console.log(`Waiting for the emulator with name "${avdName}" to boot...`)
  const emulatorId = `emulator-${adbPort}`
  let isBooted = false
  do {
    try {
      await utils.general.sleep(5000)
      const {stdout} = await utils.process.sh(`adb -s ${emulatorId} shell getprop sys.boot_completed`, {
        spawnOptions: {stdio: 'pipe'},
      })
      isBooted = stdout.replace(/[\t\r\n\s]+/g, '') === '1'
    } catch (err) {
      isBooted = false
    }
  } while (!isBooted)

  return emulatorId
}
