// used to gather projections from ASTs in GraphQL
module.exports = fieldASTs => {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce(
    (projections, selection) => {
      projections.push(selection.name.value);
      return projections
    },
    []
  )
}
