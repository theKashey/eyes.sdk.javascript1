const fs = require('fs')
const path = require('path')

function generateDockerComposeConfig({saveToDisk, platform = process.platform} = {}) {
  const volumes = ['/dev/shm:/dev/shm']
  if (process.env.VOLUME) volumes.push(process.env.VOLUME)
  const environment = ['SE_NODE_OVERRIDE_MAX_SESSIONS=true', 'SE_NODE_MAX_SESSIONS=15']
  const config = {
    version: '3.4',
    services: {
      chrome: {
        image: 'selenium/standalone-chrome',
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
