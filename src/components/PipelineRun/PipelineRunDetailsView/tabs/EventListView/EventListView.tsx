import * as React from 'react';
import {
  Bullseye,
  EmptyState,
  EmptyStateBody,
  Spinner,
} from '@patternfly/react-core';
import {
  PlayIcon,
  PauseIcon,
} from '@patternfly/react-icons/dist/esm/icons';
import { useEventsByPipelineRun } from '~/hooks/useEventsByPipelineRun';
import { Timestamp } from '../../../../../shared/components/timestamp/Timestamp';
import { getErrorState } from '../../../../../shared/utils/error-utils';
import { EventKind } from '../../../../../types';

import './EventListView.scss';

type Props = {
  namespace: string;
  pipelineRunName: string;
};

// --- Toggle play/pause button (matches OpenShift Console's TogglePlay) ---
const TogglePlay: React.FC<{
  active: boolean;
  onClick: () => void;
  className?: string;
}> = ({ active, onClick, className }) => (
  <button
    type="button"
    className={`co-toggle-play ${active ? 'co-toggle-play--active' : ''} ${className || ''}`}
    onClick={onClick}
    title={active ? 'Pause event streaming' : 'Resume event streaming'}
  >
    {active ? <PauseIcon /> : <PlayIcon />}
  </button>
);

// --- Single event row (matches OpenShift Console's Inner component) ---
const SysEvent: React.FC<{ event: EventKind; index: number }> = ({ event, index }) => {
  const isWarning = event.type === 'Warning';
  const { involvedObject: obj, source, message, reason, reportingComponent } = event;
  const tooltipMsg = `${reason} (${obj.kind})`;
  const lastTime = event.lastTimestamp || event.eventTime;
  const firstTime = event.firstTimestamp || event.eventTime;
  const count = event.count || 1;
  const component = source?.component || reportingComponent || 'kubelet';

  // Slide-in animation for the first 6 unseen events
  const shouldAnimate = index < 6;

  return (
    <div
      className={`co-sysevent--transition ${shouldAnimate ? 'co-sysevent-slide-in' : ''}`}
    >
      <div
        className={`co-sysevent${isWarning ? ' co-sysevent--warning' : ''}`}
        data-test={isWarning ? 'event-warning' : 'event'}
      >
        <div className="co-sysevent__icon-box">
          <i className="co-sysevent-icon" title={tooltipMsg} />
          <div className="co-sysevent__icon-line" />
        </div>
        <div className="co-sysevent__box" role="gridcell">
          <div className="co-sysevent__header">
            <div className="co-sysevent__subheader">
              <span className="co-sysevent__resourcelink">
                <span className="co-sysevent__resource-icon">{obj.kind.charAt(0)}</span>
                {obj.name}
              </span>
              {obj.namespace && (
                <span className="co-sysevent__resourcelink">
                  <span className="co-sysevent__resource-icon">NS</span>
                  {obj.namespace}
                </span>
              )}
              {lastTime && <Timestamp className="co-sysevent__timestamp" timestamp={lastTime} />}
            </div>
            <div className="co-sysevent__details">
              <span className="co-sysevent__source">
                Generated from {component}
                {component === 'kubelet' && source?.host ? ` on ${source.host}` : ''}
              </span>
              <div className="co-sysevent__count-and-actions">
                {count > 1 && firstTime && (
                  <span className="co-sysevent__count">
                    {count} times in the last{' '}
                    <Timestamp timestamp={firstTime} simple omitSuffix />
                  </span>
                )}
                {count > 1 && !firstTime && (
                  <span className="co-sysevent__count">{count} times</span>
                )}
              </div>
            </div>
          </div>
          {message && (
            <div className="co-sysevent__message" tabIndex={0}>
              {message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Main event list view ---
const EventListView: React.FC<Props> = ({ namespace, pipelineRunName }) => {
  const [events, loaded, error] = useEventsByPipelineRun(namespace, pipelineRunName);
  const [active, setActive] = React.useState(true);

  const errorState = getErrorState(error, loaded, 'events');
  if (errorState) {
    return errorState;
  }

  if (!loaded) {
    return (
      <Bullseye>
        <Spinner />
      </Bullseye>
    );
  }

  if (!events || events.length === 0) {
    return (
      <EmptyState data-test="events-empty-state">
        <EmptyStateBody>
          No events found. Events are short-lived and may have expired.
        </EmptyStateBody>
      </EmptyState>
    );
  }

  const count = events.length;
  const hasEvents = count > 0;

  // Status text
  let statusBtnTxt: React.ReactNode;
  if (active) {
    statusBtnTxt = <span>Streaming events...</span>;
  } else {
    statusBtnTxt = <span>Event stream is paused.</span>;
  }

  const messageCount = `Showing ${count} event${count !== 1 ? 's' : ''}`;

  const timelineClass = `co-sysevent-stream__timeline${!hasEvents ? ' co-sysevent-stream__timeline--empty' : ''}`;

  return (
    <div className="co-sysevent-stream">
      <div className="co-sysevent-stream__status">
        <div>{statusBtnTxt}</div>
        <div className="co-sysevent-stream__totals" data-test="event-totals">
          {messageCount}
        </div>
      </div>

      <div className={timelineClass}>
        <TogglePlay
          active={active}
          onClick={() => setActive((prev) => !prev)}
          className="co-sysevent-stream__timeline__btn"
        />
        <div className="co-sysevent-stream__timeline__end-message">
          Older events are not stored.
        </div>
      </div>

      {events.map((event, index) => (
        <SysEvent
          key={event.metadata?.uid || event.metadata?.name || index}
          event={event}
          index={index}
        />
      ))}
    </div>
  );
};

export default EventListView;
