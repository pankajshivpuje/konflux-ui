import React from 'react';
import {
  Alert,
  Banner,
  Bullseye,
  Button,
  Flex,
  FlexItem,
  MenuToggle,
  Select,
  SelectList,
  SelectOption,
  Spinner,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
  ToolbarToggleGroup,
  Tooltip,
  Truncate,
} from '@patternfly/react-core';
import {
  CompressIcon,
  DownloadIcon,
  ExpandIcon,
  OutlinedPlayCircleIcon,
  PauseIcon,
  PlayIcon,
  SearchIcon,
} from '@patternfly/react-icons/dist/esm/icons';
import {
  LogViewerSearch,
  LogViewerContext,
  LogViewerToolbarContext,
} from '@patternfly/react-log-viewer';
import classNames from 'classnames';
import { saveAs } from 'file-saver';
import { debounce } from 'lodash-es';
import { v4 as uuidv4 } from 'uuid';
import { FeatureFlagIndicator } from '~/feature-flags/FeatureFlagIndicator';
import { useAutoScrollWithResume } from '~/shared/components/pipeline-run-logs/logs/useAutoScrollWithResume';
import { useLogViewerSearch } from '~/shared/components/pipeline-run-logs/logs/useLogViewerSearch';
import { LoadingInline } from '~/shared/components/status-box/StatusBox';
import { VirtualizedLogViewer } from '~/shared/components/virtualized-log-viewer';
import { useFullscreen } from '~/shared/hooks/fullscreen';
import { TaskRunKind } from '~/types';
import LogsTaskDuration from './LogsTaskDuration';

import './LogViewer.scss';

// ANSI escape code regex for removing color codes from terminal output
// ESC character (\u001b) is a control character but necessary for ANSI escape sequences
// eslint-disable-next-line no-control-regex
const ANSI_ESCAPE_REGEX = /\u001b\[[0-9;]*m/g;

// Stream status constants (matching OpenShift Console)
const STREAM_EOF = 'eof';
const STREAM_LOADING = 'loading';
const STREAM_PAUSED = 'paused';
const STREAM_ACTIVE = 'streaming';

export type Props = {
  showSearch?: boolean;
  data: string;
  allowAutoScroll?: boolean;
  downloadAllLabel?: string;
  onDownloadAll?: () => Promise<Error>;
  taskRun: TaskRunKind | null;
  isLoading: boolean;
  errorMessage: string | null;
  onScroll?: (props: {
    scrollDirection: 'forward' | 'backward';
    scrollOffset: number;
    scrollUpdateWasRequested: boolean;
  }) => void;
};

// --- TogglePlay button (matches OpenShift Console's toggle-play) ---
const TogglePlay: React.FC<{
  active: boolean;
  onClick: () => void;
  className?: string;
}> = ({ active, onClick, className }) => (
  <Button
    icon={active ? <PauseIcon /> : <PlayIcon />}
    variant="plain"
    className={classNames(
      'co-toggle-play',
      active ? 'co-toggle-play--active' : 'co-toggle-play--inactive',
      className,
    )}
    onClick={onClick}
    aria-label={active ? 'Pause event streaming' : 'Start streaming events'}
  />
);

// --- Header banner showing line count + stream status ---
const HeaderBanner: React.FC<{ lineCount: number; status: string }> = ({ lineCount, status }) => {
  const isEOF = status === STREAM_EOF;
  const headerText = `${lineCount} line${lineCount !== 1 ? 's' : ''}`;
  return (
    <Banner variant={isEOF ? 'blue' : 'default'}>
      {headerText}
      {isEOF && ' - Log stream ended.'}
    </Banner>
  );
};

// --- Footer resume stream button ---
const FooterButton: React.FC<{
  onResume: () => void;
  className?: string;
}> = ({ onResume, className }) => (
  <Button
    icon={<OutlinedPlayCircleIcon />}
    className={className}
    onClick={onResume}
    isBlock
  >
    &nbsp;Resume stream
  </Button>
);

const LogViewer: React.FC<Props> = ({
  showSearch = true,
  allowAutoScroll,
  data = '',
  downloadAllLabel,
  onDownloadAll,
  taskRun,
  isLoading,
  errorMessage,
  onScroll: onScrollProp,
}) => {
  const taskName = taskRun?.spec.taskRef?.name ?? taskRun?.metadata.name;
  const [wrapLines, setWrapLines] = React.useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = React.useState(false);
  const [streamStatus, setStreamStatus] = React.useState(STREAM_EOF); // Mock data = already ended

  // Auto-scroll and resume button logic
  const { autoScroll, showResumeStreamButton, handleScroll, handleResumeClick } =
    useAutoScrollWithResume({
      allowAutoScroll,
      onScroll: onScrollProp,
    });

  // Console rewind action adds \r to the logs, this replaces them not to cause line overlap
  // Remove ANSI escape codes for plain text display
  const processedData = React.useMemo(() => {
    return data.replace(/\r/g, '\n').replace(ANSI_ESCAPE_REGEX, '');
  }, [data]);

  const lines = React.useMemo(() => processedData.split('\n'), [processedData]);

  // Search state and context management
  const { logViewerContextValue, toolbarContextValue, scrolledRow } = useLogViewerSearch({
    lines,
    autoScroll,
  });

  const [isFullscreen, fullscreenRef, fullscreenToggle, isFullscreenSupported] =
    useFullscreen<HTMLDivElement>();
  const [downloadAllStatus, setDownloadAllStatus] = React.useState(false);

  const downloadLogs = () => {
    if (!data) return;
    const blob = new Blob([data], {
      type: 'text/plain;charset=utf-8',
    });
    saveAs(blob, `${taskName || `task-run-${uuidv4()}`}.log`);
  };

  const startDownloadAll = () => {
    setDownloadAllStatus(true);
    onDownloadAll()
      .then(() => {
        setDownloadAllStatus(false);
      })
      .catch((err: Error) => {
        setDownloadAllStatus(false);
        // eslint-disable-next-line no-console
        console.warn(err.message || 'Error downloading logs.');
      });
  };

  const toggleStreaming = () => {
    setStreamStatus((prev) => (prev === STREAM_ACTIVE ? STREAM_PAUSED : STREAM_ACTIVE));
  };

  // Use containerRef to measure actual height for VirtualizedLogViewer
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [viewerHeight, setViewerHeight] = React.useState<number | undefined>(undefined);

  React.useEffect(() => {
    const updateHeight = (immediate = false) => {
      if (containerRef.current) {
        const measured = containerRef.current.clientHeight;
        if (measured > 0) {
          if (immediate) {
            setViewerHeight(measured);
          } else {
            requestAnimationFrame(() => {
              setViewerHeight(measured);
            });
          }
        }
      }
    };

    updateHeight(true);

    const debouncedUpdateHeight = debounce(() => updateHeight(false), 150);

    window.addEventListener('resize', debouncedUpdateHeight);
    return () => {
      window.removeEventListener('resize', debouncedUpdateHeight);
      debouncedUpdateHeight.cancel();
    };
  }, [isFullscreen]);

  // --- Play/pause button rendering ---
  const playPauseButton = React.useMemo(() => {
    switch (streamStatus) {
      case STREAM_LOADING:
        return <LoadingInline />;
      case STREAM_ACTIVE:
      case STREAM_PAUSED:
        return (
          <Tooltip content={streamStatus === STREAM_ACTIVE ? 'Log streaming...' : 'Log stream paused.'}>
            <TogglePlay active={streamStatus === STREAM_ACTIVE} onClick={toggleStreaming} />
          </Tooltip>
        );
      case STREAM_EOF:
      default:
        return null;
    }
  }, [streamStatus]);

  // --- Options dropdown (matches Console's Select with wrap lines) ---
  const optionsDropdown = (
    <Select
      toggle={(toggleRef: React.Ref<HTMLButtonElement>) => (
        <MenuToggle
          ref={toggleRef}
          onClick={() => setIsOptionsOpen((isOpen) => !isOpen)}
          isExpanded={isOptionsOpen}
          data-test="resource-log-options-toggle"
        >
          Options
        </MenuToggle>
      )}
      onSelect={(_event, value: string) => {
        if (value === 'wrapLines') {
          setWrapLines((prev) => !prev);
        }
      }}
      onOpenChange={setIsOptionsOpen}
      isOpen={isOptionsOpen}
    >
      <SelectList>
        <SelectOption
          key="wrapLines"
          value="wrapLines"
          isSelected={wrapLines}
          hasCheckbox
          data-test-dropdown-menu="wrap-lines"
        >
          Wrap lines
        </SelectOption>
      </SelectList>
    </Select>
  );

  // --- Toolbar matching Console's LogControls layout ---
  const logControls = (
    <Toolbar data-test="resource-log-toolbar">
      <ToolbarContent alignItems="center">
        <ToolbarGroup align={{ default: 'alignLeft' }}>
          <ToolbarItem>
            <FeatureFlagIndicator flags={['kubearchive-logs', 'taskruns-kubearchive']} />
          </ToolbarItem>
          {playPauseButton && (
            <ToolbarItem>{playPauseButton}</ToolbarItem>
          )}
          <ToolbarItem>{optionsDropdown}</ToolbarItem>
        </ToolbarGroup>

        <ToolbarGroup align={{ default: 'alignRight' }}>
          {showSearch && (
            <ToolbarToggleGroup toggleIcon={<SearchIcon />} breakpoint="lg">
              <ToolbarItem>
                <LogViewerSearch placeholder="Search" minSearchChars={0} />
              </ToolbarItem>
            </ToolbarToggleGroup>
          )}

          <ToolbarGroup variant="icon-button-group">
            <ToolbarItem>
              <Tooltip content="Download">
                <Button variant="plain" onClick={downloadLogs} icon={<DownloadIcon />} aria-label="Download" />
              </Tooltip>
            </ToolbarItem>
            {onDownloadAll && (
              <ToolbarItem>
                <Tooltip content={downloadAllLabel || 'Download all task logs'}>
                  <Button
                    variant="plain"
                    onClick={startDownloadAll}
                    isDisabled={downloadAllStatus}
                    icon={<DownloadIcon />}
                    aria-label={downloadAllLabel || 'Download all task logs'}
                  />
                </Tooltip>
                {downloadAllStatus && <LoadingInline />}
              </ToolbarItem>
            )}
            {fullscreenToggle && isFullscreenSupported && (
              <ToolbarItem>
                <Tooltip content={isFullscreen ? 'Collapse' : 'Expand'}>
                  <Button
                    variant="plain"
                    onClick={fullscreenToggle}
                    icon={isFullscreen ? <CompressIcon /> : <ExpandIcon />}
                    aria-label={isFullscreen ? 'Collapse' : 'Expand'}
                  />
                </Tooltip>
              </ToolbarItem>
            )}
          </ToolbarGroup>
        </ToolbarGroup>
      </ToolbarContent>
    </Toolbar>
  );

  return (
    <LogViewerContext.Provider value={logViewerContextValue}>
      <LogViewerToolbarContext.Provider value={toolbarContextValue}>
        <div
          ref={fullscreenRef}
          style={{ height: isFullscreen ? '100vh' : '100%' }}
          className={classNames('log-viewer__container', 'pf-v5-c-log-viewer', 'pf-m-dark')}
        >
          {/* Toolbar */}
          <div className="pf-v5-c-log-viewer__header">
            {logControls}
          </div>

          {/* Header — line count banner + task name */}
          <Flex
            gap={{ default: 'gapNone' }}
            direction={{ default: 'column' }}
            fullWidth={{ default: 'fullWidth' }}
            className="log-window__header"
          >
            {errorMessage && (
              <Alert variant="danger" isInline title={errorMessage} />
            )}
            <HeaderBanner lineCount={lines.length} status={streamStatus} />
            <Banner data-testid="logs-taskName">
              <Flex gap={{ default: 'gapSm' }}>
                {taskName && (
                  <FlexItem flex={{ default: 'flex_1' }} className="log-viewer__task-name">
                    <Truncate content={taskName} />
                  </FlexItem>
                )}
                <FlexItem flex={{ default: 'flexNone' }}>
                  <LogsTaskDuration taskRun={taskRun} />
                </FlexItem>
              </Flex>
              {isLoading && (
                <Bullseye>
                  <Spinner size="lg" />
                </Bullseye>
              )}
            </Banner>
          </Flex>

          {/* Log Viewer */}
          <div ref={containerRef} className="log-viewer__content">
            {viewerHeight && (
              <VirtualizedLogViewer
                key={taskRun?.metadata?.uid || 'default'}
                data={processedData}
                height={viewerHeight}
                scrollToRow={scrolledRow}
                onScroll={handleScroll}
              />
            )}
          </div>

          {/* Footer — resume stream button (hidden when not paused) */}
          {showResumeStreamButton && (
            <div className="log-viewer__resume-stream-button-wrapper">
              <FooterButton onResume={handleResumeClick} />
            </div>
          )}
        </div>
      </LogViewerToolbarContext.Provider>
    </LogViewerContext.Provider>
  );
};

export default LogViewer;
