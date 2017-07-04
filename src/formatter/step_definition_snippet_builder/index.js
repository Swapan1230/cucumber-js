import _ from 'lodash'
import { CucumberExpressionGenerator } from 'cucumber-expressions'
import KeywordType from '../../keyword_type'

export default class StepDefinitionSnippetBuilder {
  constructor({ snippetSyntax, parameterTypeRegistry }) {
    this.snippetSyntax = snippetSyntax
    this.cucumberExpressionGenerator = new CucumberExpressionGenerator(
      parameterTypeRegistry
    )
  }

  build({ keywordType, pickledStep }) {
    const functionName = this.getFunctionName(keywordType)
    const generatedExpression = this.cucumberExpressionGenerator.generateExpression(
      pickledStep.text,
      true
    )
    const pattern = generatedExpression.source
    const parameters = this.getParameters(
      pickledStep,
      generatedExpression.parameterNames
    )
    const comment =
      'Write code here that turns the phrase above into concrete actions'
    return this.snippetSyntax.build(functionName, pattern, parameters, comment)
  }

  getFunctionName(keywordType) {
    switch (keywordType) {
      case KeywordType.EVENT:
        return 'When'
      case KeywordType.OUTCOME:
        return 'Then'
      case KeywordType.PRECONDITION:
        return 'Given'
    }
  }

  getParameters(step, expressionParameterNames) {
    return _.concat(
      expressionParameterNames,
      this.getStepArgumentParameters(step),
      'callback'
    )
  }

  getStepArgumentParameters(step) {
    return step.arguments.map(function(arg) {
      if (arg.hasOwnProperty('rows')) {
        return 'table'
      } else if (arg.hasOwnProperty('content')) {
        return 'string'
      } else {
        throw new Error(`Unknown argument type: ${arg}`)
      }
    })
  }
}
