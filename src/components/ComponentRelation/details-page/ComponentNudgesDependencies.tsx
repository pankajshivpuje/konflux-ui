import * as React from 'react';
import { Alert, ExpandableSection, Radio, Tooltip } from '@patternfly/react-core';
import { OutlinedQuestionCircleIcon } from '@patternfly/react-icons/dist/esm/icons/outlined-question-circle-icon';
import { useNamespace } from '../../../shared/providers/Namespace';
import { ComponentKind } from '../../../types';
import { useInboundNudges, useNudgeConfig, useOutboundNudges } from '../useNudgeConfig';
import ComponentNudgesSVG, { NudgeRadios } from './ComponentNudges';

import './ComponentNudgesDependencies.scss';

type ComponentBuildSettingsProps = {
  component: ComponentKind;
};

const ComponentBuildSettings: React.FC<React.PropsWithChildren<ComponentBuildSettingsProps>> = ({
  component,
}) => {
  const [radioChecked, setRadioChecked] = React.useState<string>(NudgeRadios.NUDGES);
  const [expanded, setExpanded] = React.useState<boolean>(true);
  const namespace = useNamespace();
  const componentName = component?.metadata?.name;

  const [nudgeConfig] = useNudgeConfig(namespace);
  const [outboundNudges, , outboundError] = useOutboundNudges(namespace, componentName);
  const [inboundNudges, , inboundError] = useInboundNudges(namespace, componentName);

  const staleConditions = React.useMemo(
    () => (nudgeConfig?.status?.conditions ?? []).filter((c) => c.status === 'False'),
    [nudgeConfig],
  );

  if (!component) {
    return null;
  }

  const setNudgeRadio = (radio: NudgeRadios) => {
    radioChecked !== radio && setRadioChecked(radio);
  };

  return (
    <div className="component-nudges" data-test="component-nudges-dependencies">
      {staleConditions.length > 0 && (
        <Alert
          variant="warning"
          isInline
          title="Some nudge references are stale"
          className="pf-v6-u-mb-md"
          data-test="nudge-stale-warning"
        >
          {staleConditions.map((c, i) => (
            <p key={i}>{c.message}</p>
          ))}
        </Alert>
      )}
      {(outboundError || inboundError) && (
        <Alert
          variant="danger"
          isInline
          title="Failed to load nudge configuration"
          className="pf-v6-u-mb-md"
          data-test="nudge-load-error"
        />
      )}
      <ExpandableSection
        isExpanded={expanded}
        toggleContent="Show related components"
        className="component-nudges__exandablesection pf-v6-u-mt-md"
        data-test="component-nudges-toggle"
        onToggle={() => setExpanded((x) => !x)}
      >
        <div className="pf-v6-u-pl-md pf-v6-u-mt-md">
          <Radio
            isChecked={radioChecked === NudgeRadios.NUDGES}
            name="radio-nudges"
            data-test="nudges-radio"
            onChange={() => setNudgeRadio(NudgeRadios.NUDGES)}
            label={
              <span className="component-nudges__radio">
                Nudges{' '}
                <Tooltip content="The component's builds propagate changes to the nudged components.">
                  <OutlinedQuestionCircleIcon />
                </Tooltip>
              </span>
            }
            id="radio-nudges"
          />
          <Radio
            isChecked={radioChecked === NudgeRadios.NUDGED_BY}
            name="radio-nudged-by"
            data-test="nudged-by-radio"
            onChange={() => setNudgeRadio(NudgeRadios.NUDGED_BY)}
            label={
              <span className="component-nudges__radio">
                Is nudged by{' '}
                <Tooltip content="The component will be changed by the nudging component's builds.">
                  <OutlinedQuestionCircleIcon />
                </Tooltip>
              </span>
            }
            id="radio-nudge"
          />
          <ComponentNudgesSVG
            radioChecked={radioChecked}
            nudgeComponents={radioChecked === NudgeRadios.NUDGES ? outboundNudges : inboundNudges}
            component={component}
          />
        </div>
      </ExpandableSection>
    </div>
  );
};

export default React.memo(ComponentBuildSettings);
