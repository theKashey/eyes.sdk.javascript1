import { TestResultContainer } from "@applitools/eyes-api"

const testName = 'Cypress typescript test'

describe(testName, () => {
  beforeEach(() => {
    const url = 'https://applitools.com/helloworld'
    cy.visit(url)
  })

  it('basic with test results', () => {
    cy.eyesOpen({
      appName: 'Cypress typescript App',
      testName
    })
    cy.eyesCheckWindow({
      target: 'window',
      fully: true,
      waitBeforeCapture: 1000,
    })
    cy.eyesClose()
  })

  after(() => {
    cy.eyesGetAllTestResults().then((summary) => {
      console.log(summary.getAllResults()[0].toJSON())
      const testResults = summary.getAllResults()[0].toJSON() as TestResultContainer
      expect(summary.getAllResults()).to.have.length(1)
      expect(testResults.exception).to.be.undefined
      expect(testResults.browserInfo).to.have.property('width')
      expect(testResults.browserInfo).to.have.property('height')
      expect(testResults.testResults).to.have.property('name', testName)
      expect(testResults.testResults).to.have.property('status', 'Passed')
    })
  })
})