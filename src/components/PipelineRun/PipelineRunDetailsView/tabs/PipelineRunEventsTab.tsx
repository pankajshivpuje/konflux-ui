import * as React from 'react';
import { useParams } from 'react-router-dom';
import { useNamespace } from '~/shared/providers/Namespace';
import { RouterParams } from '../../../../routes/utils';
import EventListView from './EventListView/EventListView';

const PipelineRunEventsTab: React.FC = () => {
  const { pipelineRunName } = useParams<RouterParams>();
  const namespace = useNamespace();

  return <EventListView namespace={namespace} pipelineRunName={pipelineRunName} />;
};

export default PipelineRunEventsTab;
