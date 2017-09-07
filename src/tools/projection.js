module.exports = fieldASTs => {
  return fieldASTs.fieldNodes[0].selectionSet.selections.reduce(
    (projections, selection) => {
      if(!selection.selectionSet) { // ignore related tables for SELECT fields
        projections[selection.name.value] = true
      }
      return projections
    },
    {}
  )
}
