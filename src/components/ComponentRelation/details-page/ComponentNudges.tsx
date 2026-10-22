import * as React from 'react';
import { Link } from 'react-router-dom';
import { Button, Content, Label } from '@patternfly/react-core';
import { ExternalLinkAltIcon } from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';
import { css } from '@patternfly/react-styles';
import { useAllComponents } from '../../../hooks/useComponents';
import { COMPONENT_DETAILS_PATH, APPLICATION_DETAILS_PATH } from '../../../routes/paths';
import { useNamespace } from '../../../shared/providers/Namespace';
import { ComponentKind } from '../../../types';
import { NudgeConfigNudge } from '../../../types/nudge-config';
import './ComponentNudges.scss';

export const enum NudgeRadios {
  NUDGES = 'nudges',
  NUDGED_BY = 'isNudgedBy',
}

interface ComponentNudgesSVGprops {
  /** Nudges filtered for this direction (outbound or inbound). */
  nudgeComponents: NudgeConfigNudge[];
  radioChecked: string;
  component: ComponentKind;
}

const ModeBadge: React.FC<{ mode: NudgeConfigNudge['mode'] }> = ({ mode }) => (
  <Label
    isCompact
    color={mode === 'validated' ? 'blue' : 'grey'}
    className="pf-v6-u-ml-sm"
    data-test={`nudge-mode-badge-${mode}`}
  >
    {mode === 'validated' ? 'Validated' : 'Immediate'}
  </Label>
);

const ComponentNudgesSVG: React.FC<ComponentNudgesSVGprops> = ({
  nudgeComponents,
  radioChecked,
  component,
}) => {
  const namespace = useNamespace();
  const [components, loaded, error] = useAllComponents(namespace);

  const emptyState = (
    <div data-test="nudges-empty-state" className="component-nudges__empty-state">
      No dependencies found
    </div>
  );

  const isNudges = radioChecked === NudgeRadios.NUDGES;

  const relatedComponentMap = React.useMemo(() => {
    if (!loaded || error) return new Map<string, ComponentKind>();
    return new Map(components.map((c) => [c.metadata.name, c]));
  }, [components, loaded, error]);

  if (!nudgeComponents || nudgeComponents.length === 0) {
    return emptyState;
  }

  return (
    <div
      className={css(
        'component-nudge',
        'component-nudge__tree',
        isNudges && 'component-nudge__nudges-arrow',
        !isNudges && 'component-nudge__nudged-by-arrow',
      )}
    >
      <Content component="p" style={{ marginTop: 'var(--pf-t--global--spacer--lg)' }}>
        <b>{component.metadata.name}</b>
      </Content>
      <ul>
        {nudgeComponents.map((nudge, i) => {
          const relatedName = isNudges ? nudge.to : nudge.from;
          const comp = relatedComponentMap.get(relatedName);

          return (
            <li key={i} data-test="nudges-connector">
              {comp ? (
                <Link
                  to={COMPONENT_DETAILS_PATH.createPath({
                    workspaceName: namespace,
                    applicationName: comp.spec?.application,
                    componentName: comp.metadata.name,
                  })}
                  data-test={isNudges ? 'nudges-cmp-link' : 'nudged-by-cmp-link'}
                >
                  {comp.metadata.name}
                </Link>
              ) : (
                <span data-test={isNudges ? 'nudges-cmp-link' : 'nudged-by-cmp-link'}>
                  {relatedName}
                </span>
              )}
              <ModeBadge mode={nudge.mode} />
              {comp && comp.spec?.application !== component.spec?.application ? (
                <>
                  (
                  <Button
                    isInline
                    variant="link"
                    icon={<ExternalLinkAltIcon />}
                    iconPosition="end"
                    component={(props) => (
                      <Link
                        {...props}
                        to={`${APPLICATION_DETAILS_PATH.createPath({ workspaceName: namespace, applicationName: comp?.spec?.application })}/`}
                        target="_blank"
                      />
                    )}
                  >
                    {comp.spec?.application}
                  </Button>
                  )
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ComponentNudgesSVG;
