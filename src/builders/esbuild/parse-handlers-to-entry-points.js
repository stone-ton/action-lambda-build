const parseHandlersToEntrypoints = (handlers, build) => handlers.reduce(
  (previous, handler) => {
    let outputKey = build.individually ? 
      `${handler.lambda_name}/${handler.output}` :
      `lambdas/${handler.output}`

    outputKey = outputKey.replace('.js', '')

    return {
      ...previous,
      [outputKey]: handler.entry_point
    }
  },
{})

module.exports = parseHandlersToEntrypoints