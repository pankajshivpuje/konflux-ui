import * as React from 'react';
import {
  Button,
  Flex,
  FlexItem,
  Label,
  LabelGroup,
  Split,
  SplitItem,
  ToggleGroup,
  ToggleGroupItem,
} from '@patternfly/react-core';
import { MinusCircleIcon } from '@patternfly/react-icons/dist/esm/icons/minus-circle-icon';
import { useField } from 'formik';
import {
  MultiSelectComponentsDropdown,
  SingleSelectComponentDropdown,
} from './ComponentRelationshipDropdowns';
import { ComponentRelationNudgeType } from './type';

type ComponentRelationProps = {
  componentNames: string[];
  sortedGroupedComponents: { [application: string]: string[] };
  index?: number;
  removeProps: {
    disableRemove: boolean;
    onRemove: () => void;
  };
};

export const ComponentRelation: React.FC<ComponentRelationProps> = ({
  index,
  componentNames,
  sortedGroupedComponents,
  removeProps: { disableRemove, onRemove },
}) => {
  const sourceName = `relations.${index.toString()}.source`;
  const nudgeName = `relations.${index.toString()}.nudgeType`;
  const targetName = `relations.${index.toString()}.target`;
  const [{ value: sourceValue }] = useField(sourceName);
  const [{ value: nudgeValue }, , { setValue: setNudgeValue }] = useField(nudgeName);
  const [{ value: targetValue }, , { setValue: setTargetValue }] =
    useField<string[]>(targetName);

  const handleNudgesChange = React.useCallback(
    (_event: React.MouseEvent | React.KeyboardEvent, selected: boolean) => {
      if (selected) {
        void setNudgeValue(ComponentRelationNudgeType.NUDGES);
      }
    },
    [setNudgeValue],
  );

  const handleNudgedByChange = React.useCallback(
    (_event: React.MouseEvent | React.KeyboardEvent, selected: boolean) => {
      if (selected) {
        void setNudgeValue(ComponentRelationNudgeType.NUDGED_BY);
      }
    },
    [setNudgeValue],
  );

  const handleRemoveTarget = React.useCallback(
    (targetToRemove: string) => {
      void setTargetValue(targetValue.filter((t: string) => t !== targetToRemove));
    },
    [targetValue, setTargetValue],
  );

  return (
    <Flex direction={{ default: 'column' }} gap={{ default: 'gapSm' }}>
      <Split hasGutter>
        <SplitItem isFilled>
          <SingleSelectComponentDropdown
            name={sourceName}
            componentNames={componentNames}
            disableMenuItem={(item) => targetValue.includes(item)}
          />
        </SplitItem>
        <SplitItem>
          <ToggleGroup aria-label="Relationship type">
            <ToggleGroupItem
              text="Nudges"
              buttonId={`nudges-${index}`}
              isSelected={nudgeValue === ComponentRelationNudgeType.NUDGES}
              onChange={handleNudgesChange}
            />
            <ToggleGroupItem
              text="Nudged by"
              buttonId={`nudged-by-${index}`}
              isSelected={nudgeValue === ComponentRelationNudgeType.NUDGED_BY}
              onChange={handleNudgedByChange}
            />
          </ToggleGroup>
        </SplitItem>
        <SplitItem>
          <Button
            id={`remove-relation-${index}`}
            variant="plain"
            onClick={onRemove}
            isDisabled={disableRemove}
          >
            <MinusCircleIcon />
          </Button>
        </SplitItem>
      </Split>

      <FlexItem>
        <MultiSelectComponentsDropdown
          name={targetName}
          sourceComponentName={sourceValue}
          sortedGroupedComponents={sortedGroupedComponents}
        />
      </FlexItem>

      {targetValue?.length > 0 && (
        <FlexItem>
          <LabelGroup>
            {targetValue.map((name: string) => (
              <Label key={name} onClose={() => handleRemoveTarget(name)}>
                {name}
              </Label>
            ))}
          </LabelGroup>
        </FlexItem>
      )}
    </Flex>
  );
};
