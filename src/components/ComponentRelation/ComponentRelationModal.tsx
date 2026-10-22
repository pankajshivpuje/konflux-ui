import * as React from 'react';
import { Formik, FormikHelpers } from 'formik';
import { logger } from '~/monitoring/logger';
import { useComponentGroups } from '../../hooks/useComponentGroups';
import { useComponents, useSortedGroupComponents } from '../../hooks/useComponents';
import { useNamespace } from '../../shared/providers/Namespace';
import { TrackEvents, useTrackEvent } from '../../utils/analytics';
import { RawComponentProps, createRawModalLauncher } from '../modal/createModalLauncher';
import {
  ConfirmCancelationComponentRelationModal,
  ConfirmSubmissionComponentRelationModal,
  DefineComponentRelationModal,
} from './cr-modals';
import { ComponentRelationFormikValue, ComponentRelationNudgeType } from './type';
import { useNudgeData } from './useNudgeData';
import { componentRelationValidationSchema, updateNudgeConfig } from './utils';

type ComponentRelationProps = { application: string };

type ComponentRelationModalProps = RawComponentProps & ComponentRelationProps;

export const ComponentRelationModal: React.FC<ComponentRelationModalProps> = ({
  modalProps,
  application,
}) => {
  const track = useTrackEvent();
  const [showCancelModal, setShowCancelModal] = React.useState<boolean>(false);
  const [showSubmissionModal, setShowSubmissionModal] = React.useState<boolean>(false);
  const [nudgeData, loaded, error] = useNudgeData(application);
  const namespace = useNamespace();
  const [componentGroups, groupsLoaded] = useComponentGroups(namespace);

  const handleSubmitError = (
    e: unknown,
    helpers: FormikHelpers<ComponentRelationFormikValue>,
  ) => {
    logger.error(
      'Error while updating dependency data for component',
      e instanceof Error ? e : undefined,
    );

    helpers.setSubmitting(false);
    helpers.setStatus({
      submitError: e instanceof Error ? e.message : String(e),
    });
  };

  const [components, cnLoaded, cnError] = useComponents(namespace, application);
  const [sortedGroupedComponents, allLoaded, allError] = useSortedGroupComponents(namespace);
  const componentNames: string[] = React.useMemo(() => {
    return cnLoaded && !cnError ? components.map((c) => c.metadata.name) : [];
  }, [cnError, cnLoaded, components]);

  const componentGroupNames: string[] = React.useMemo(() => {
    return groupsLoaded ? componentGroups.map((g) => g.metadata.name) : [];
  }, [componentGroups, groupsLoaded]);

  const onSaveRelationships = React.useCallback(() => {
    setShowSubmissionModal(true);
  }, []);

  const onCancelSaveRelationships = React.useCallback(() => {
    track(TrackEvents.ButtonClicked, {
      link_name: 'component-relationship-modal-leave',
      app_name: application,
      namespace,
    });
    setShowCancelModal(true);
  }, [application, track, namespace]);

  const initialValues: ComponentRelationFormikValue = React.useMemo(() => {
    return {
      relations:
        loaded && !error && nudgeData.length > 0
          ? nudgeData.map((r) => ({ mode: 'immediate' as const, ...r }))
          : [{ source: '', nudgeType: ComponentRelationNudgeType.NUDGES, target: [], mode: 'immediate' as const }],
    };
  }, [error, loaded, nudgeData]);

  const handleSubmit = React.useCallback(
    async (
      values: ComponentRelationFormikValue,
      helpers: FormikHelpers<ComponentRelationFormikValue>,
    ) => {
      track(TrackEvents.ButtonClicked, {
        link_name: 'component-relationship-modal-submit',
        app_name: application,
      });
      try {
        await updateNudgeConfig(values.relations, namespace, true);
      } catch (e: unknown) {
        handleSubmitError(e, helpers);
        return;
      }
      return updateNudgeConfig(values.relations, namespace)
        .then(() => {
          track('Component relationship updated', {
            app_name: application,
            namespace,
          });
          onSaveRelationships();
        })
        .catch((e: unknown) => {
          handleSubmitError(e, helpers);
        });
    },
    [application, namespace, onSaveRelationships, track, initialValues],
  );

  if (showSubmissionModal && !showCancelModal) {
    return <ConfirmSubmissionComponentRelationModal modalProps={modalProps} />;
  }
  return (
    <Formik
      initialValues={initialValues}
      validationSchema={componentRelationValidationSchema}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {showCancelModal && !showSubmissionModal ? (
        <ConfirmCancelationComponentRelationModal
          modalProps={modalProps}
          onGoBack={() => setShowCancelModal(false)}
        />
      ) : (
        <DefineComponentRelationModal
          componentNames={cnLoaded && !cnError ? componentNames : []}
          sortedGroupedComponents={
            allLoaded && !allError
              ? sortedGroupedComponents
              : ({} as { [application: string]: string[] })
          }
          componentGroupNames={componentGroupNames}
          modalProps={modalProps}
          onCancel={onCancelSaveRelationships}
        />
      )}
    </Formik>
  );
};

export const createComponentRelationModal = (props: ComponentRelationProps) =>
  createRawModalLauncher<ComponentRelationProps, Record<string, unknown>>(ComponentRelationModal, {
    'data-test': 'component-relation-modal',
  })(props);
