const fs = require('fs')
const path = require('path')
const os = require('os')

function generateDockerComposeConfig({saveToDisk, platform = process.platform} = {}) {
  const volumes = ['/dev/shm:/dev/shm']
  if (process.env.VOLUME) volumes.push(process.env.VOLUME)
  let chromeImage 
  // use seleniarm/standalone-chromium for Mac with Apple chip (M1)
  // since selenium/standalone-chrome doesn't support the M1 architecture
  // re: https://github.com/seleniumhq/docker-selenium#experimental-mult-arch-aarch64armhfamd64-images
  chromeImage = os.cpus()[0].model.includes('M1') ? 'seleniarm/standalone-chromium:4.1.3-20220331' : 'selenium/standalone-chrome:4.1.3-20220327' 
  chromeImage = process.env.CHROME_IMAGE || chromeImage
  const environment = ['SE_NODE_OVERRIDE_MAX_SESSIONS=true', 'SE_NODE_MAX_SESSIONS=30']
  const config = {
    version: '3.4',
    services: {
      chrome: {
        image: chromeImage,
        environment,
        volumes,
        ...generateNetworkConfigForPlatform(platform),
      },
      firefox: {
        image: 'selenium/standalone-firefox',
        environment,
        volumes,
        ports: ['4445:4444'],
      },
    },
  }
  const result = JSON.stringify(config, null, 2)
  if (saveToDisk) {
    fs.writeFileSync(path.resolve(process.cwd(), 'docker-compose.yaml'), result)
  }
  return result
}

function generateNetworkConfigForPlatform(platform) {
  return platform === 'linux'
    ? {network_mode: 'host'}
    : {
        ports: [
          '4444:4444',
          '9515:9515',
          '5900:5900',
          {
            target: 5555,
            protocol: 'tcp',
            mode: 'host',
          },
          {
            target: 5556,
            protocol: 'tcp',
            mode: 'host',
          },
          {
            target: 5557,
            protocol: 'tcp',
            mode: 'host',
          },
        ],
      }
}

if (require.main === module) {
  generateDockerComposeConfig({saveToDisk: true})
}

module.exports = generateDockerComposeConfig
