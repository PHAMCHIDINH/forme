export type TwoColumnEligibilityCriteria = {
  layoutHasRoom: boolean;
  labelIsShort: boolean;
  controlIsCompact: boolean;
  helperTextIsShort: boolean;
  fieldHasSingleControl: boolean;
  fieldHasNoSupplementaryHint: boolean;
  fieldCanStayAligned: boolean;
};

export function isTwoColumnEligible(criteria: TwoColumnEligibilityCriteria): boolean {
  return (
    criteria.layoutHasRoom &&
    criteria.labelIsShort &&
    criteria.controlIsCompact &&
    criteria.helperTextIsShort &&
    criteria.fieldHasSingleControl &&
    criteria.fieldHasNoSupplementaryHint &&
    criteria.fieldCanStayAligned
  );
}
