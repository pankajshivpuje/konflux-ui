import * as React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  FormGroup,
  Label,
  LabelGroup,
  Truncate,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { useField } from 'formik';
import { SegmentedToggle } from '~/shared/components/segmented-toggle';
import {
  MultiSelectComponentsDropdown,
  SingleSelectComponentDropdown,
} from './ComponentRelationshipDropdowns';
import { ComponentRelationNudgeType } from './type';

type ComponentRelationProps = {
  componentNames: string[];
  sortedGroupedComponents: { [application: string]: string[] };
  /** Available ComponentGroup names for the gating group dropdown. */
  componentGroupNames: string[];
  index?: number;
  removeProps: {
    disableRemove: boolean;
    onRemove: () => void;
  };
};

const TARGET_LABELS_VISIBLE = 3;

const getModeToggleOptions = (index?: number) => [
  {
    value: 'immediate',
    label: 'Immediate',
    tooltip: 'The nudge fires as soon as the source build completes.',
    id: `mode-immediate-${index}`,
  },
  {
    value: 'validated',
    label: 'Validated',
    tooltip: 'The nudge is gated on a ComponentGroup passing its tests.',
    id: `mode-validated-${index}`,
  },
];

const getNudgeToggleOptions = (index?: number) => [
  {
    value: ComponentRelationNudgeType.NUDGES,
    label: 'Nudges',
    tooltip: "The component's builds propagate changes to the nudged component.",
    id: `nudges-${index}`,
  },
  {
    value: ComponentRelationNudgeType.NUDGED_BY,
    label: 'Nudged by',
    tooltip: "The component will be changed by nudging component's build.",
    id: `nudged-by-${index}`,
  },
];

export const ComponentRelation: React.FC<ComponentRelationProps> = ({
  index,
  componentNames,
  sortedGroupedComponents,
  componentGroupNames,
  removeProps: { disableRemove, onRemove },
}) => {
  const sourceName = `relations.${index.toString()}.source`;
  const nudgeName = `relations.${index.toString()}.nudgeType`;
  const targetName = `relations.${index.toString()}.target`;
  const modeName = `relations.${index.toString()}.mode`;
  const gatingGroupName = `relations.${index.toString()}.gatingGroup`;
  const [{ value: sourceValue }] = useField(sourceName);
  const [{ value: nudgeValue }, , { setValue: setNudgeValue }] = useField(nudgeName);
  const [{ value: targetValue }, , { setValue: setTargetValue }] = useField<string[]>(targetName);
  const [{ value: modeValue }, , { setValue: setModeValue }] = useField<'immediate' | 'validated'>(modeName);
  const [, , { setValue: setGatingGroupValue }] = useField<string | undefined>(gatingGroupName);
  const [isTargetMenuOpen, setIsTargetMenuOpen] = React.useState(false);

  const gatingGroupOptions = React.useMemo(() => [...componentGroupNames].sort(), [componentGroupNames]);

  const visibleTargetValues = React.useMemo(
    () => targetValue.slice(0, TARGET_LABELS_VISIBLE),
    [targetValue],
  );
  const hiddenTargetCount = targetValue.length - visibleTargetValues.length;

  const handleRemoveTarget = (component: string) => {
    void setTargetValue(targetValue.filter((item) => item !== component));
  };

  const handleShowMoreTargets = React.useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsTargetMenuOpen(true);
  }, []);

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapMd' }}>
      <FlexItem>
        <Flex gap={{ default: 'gapMd' }}>
          <FlexItem flex={{ default: 'flex_1' }}>
            <SingleSelectComponentDropdown
              name={sourceName}
              componentNames={componentNames}
              disableMenuItem={(item) => targetValue.includes(item)}
            />
          </FlexItem>
          <FlexItem>
            <SegmentedToggle
              aria-label="Nudge relationship type"
              value={nudgeValue}
              onChange={(value) => void setNudgeValue(value)}
              options={getNudgeToggleOptions(index)}
            />
          </FlexItem>
          <FlexItem>
            <Button
              id={`remove-relation-${index}`}
              variant="plain"
              onClick={onRemove}
              isDisabled={disableRemove}
            >
              <MinusCircleIcon />
            </Button>
          </FlexItem>
        </Flex>
      </FlexItem>
      <FlexItem>
        <Flex direction={{ default: 'column' }}>
          <FlexItem>
            <MultiSelectComponentsDropdown
              name={targetName}
              sourceComponentName={sourceValue}
              sortedGroupedComponents={sortedGroupedComponents}
              isOpen={isTargetMenuOpen}
              onOpenChange={setIsTargetMenuOpen}
            />
          </FlexItem>
          {targetValue?.length > 0 ? (
            <FlexItem>
              <LabelGroup numLabels={targetValue.length} aria-label="Selected components to nudge">
                {visibleTargetValues.map((component) => (
                  <Label
                    key={component}
                    onClose={() => handleRemoveTarget(component)}
                    closeBtnAriaLabel={`Remove ${component}`}
                  >
                    <Truncate content={component} position="middle" />
                  </Label>
                ))}
                {hiddenTargetCount > 0 ? (
                  <Label
                    variant="overflow"
                    onClick={handleShowMoreTargets}
                    aria-label={`Show ${hiddenTargetCount} more selected components`}
                  >
                    + {hiddenTargetCount} more
                  </Label>
                ) : null}
              </LabelGroup>
            </FlexItem>
          ) : null}
        </Flex>
      </FlexItem>
      <FlexItem>
        <FormGroup label="Nudge mode" fieldId={`nudge-mode-${index}`}>
          <SegmentedToggle
            aria-label="Nudge mode"
            value={modeValue}
            onChange={(value) => {
              void setModeValue(value as 'immediate' | 'validated');
              if (value === 'immediate') {
                void setGatingGroupValue(undefined);
              }
            }}
            options={getModeToggleOptions(index)}
          />
        </FormGroup>
      </FlexItem>
      {modeValue === 'validated' ? (
        <FlexItem>
          <FormGroup
            label="Gating group"
            fieldId={`gating-group-${index}`}
            isRequired
          >
            <SingleSelectComponentDropdown
              name={gatingGroupName}
              componentNames={gatingGroupOptions}
            />
          </FormGroup>
        </FlexItem>
      ) : null}
    </Flex>
  );
};
