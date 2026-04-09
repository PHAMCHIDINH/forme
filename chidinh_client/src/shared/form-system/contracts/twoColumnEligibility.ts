export type TwoColumnEligibilityCriteria = {
  fieldsAreLogicallyIndependent: boolean;
  scanOrderIsNotStronglySequential: boolean;
  helperAndErrorTextStayCompact: boolean;
  mobileCollapsePreservesGrouping: boolean;
  hasNoCrossColumnDependencyReveal: boolean;
  summaryAndActionsStayInNaturalFlow: boolean;
  errorStateRemainsReadable: boolean;
};

export function isTwoColumnEligible(criteria: TwoColumnEligibilityCriteria): boolean {
  return (
    criteria.fieldsAreLogicallyIndependent &&
    criteria.scanOrderIsNotStronglySequential &&
    criteria.helperAndErrorTextStayCompact &&
    criteria.mobileCollapsePreservesGrouping &&
    criteria.hasNoCrossColumnDependencyReveal &&
    criteria.summaryAndActionsStayInNaturalFlow &&
    criteria.errorStateRemainsReadable
  );
}
