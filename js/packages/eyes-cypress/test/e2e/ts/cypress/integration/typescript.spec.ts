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
      expect(summary.getAllResults()).to.have.length(1)
      expect(summary.getAllResults()[0].exception).to.be.null
      expect(summary.getAllResults()[0].browserInfo).to.have.property('width')
      expect(summary.getAllResults()[0].browserInfo).to.have.property('height')
      expect(summary.getAllResults()[0].testResults).to.have.property('name', testName)
      expect(summary.getAllResults()[0].testResults).to.have.property('status', 'Passed')
    })
  })
})