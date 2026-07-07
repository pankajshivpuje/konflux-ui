import * as React from 'react';
import { useParams } from 'react-router-dom';
import { Grid, GridItem, PageSection } from '@patternfly/react-core';
import { PipelineRunType } from '~/consts/pipelinerun';
import { PipelineRunKind } from '~/types';
import IssuesCard from './IssuesCard';
import MintmakerCard from './MintmakerCard';
import PipelineHealthCard from './PipelineHealthCard';
import RecentActivityCard from './RecentActivityCard';
import ReleaseHealthCard from './ReleaseHealthCard';
import './NamespaceOverviewTab.scss';

const NamespaceOverviewTab: React.FC = () => {
  const { workspaceName } = useParams<{ workspaceName: string }>();
  const namespace = workspaceName;

  const [buildPLRs, setBuildPLRs] = React.useState<PipelineRunKind[]>([]);
  const [testPLRs, setTestPLRs] = React.useState<PipelineRunKind[]>([]);
  const [buildLoaded, setBuildLoaded] = React.useState(false);
  const [testLoaded, setTestLoaded] = React.useState(false);

  const handleBuildPLRs = React.useCallback((plrs: PipelineRunKind[]) => {
    setBuildPLRs(plrs);
    setBuildLoaded(true);
  }, []);

  const handleTestPLRs = React.useCallback((plrs: PipelineRunKind[]) => {
    setTestPLRs(plrs);
    setTestLoaded(true);
  }, []);

  return (
    <PageSection>
      <Grid hasGutter className="namespace-overview-tab__grid">
        <GridItem span={6}>
          <PipelineHealthCard
            namespace={namespace}
            pipelineType={PipelineRunType.BUILD}
            onPLRsLoaded={handleBuildPLRs}
          />
        </GridItem>
        <GridItem span={6}>
          <PipelineHealthCard
            namespace={namespace}
            pipelineType={PipelineRunType.TEST}
            onPLRsLoaded={handleTestPLRs}
          />
        </GridItem>
        <GridItem span={12}>
          <RecentActivityCard
            buildPLRs={buildPLRs}
            testPLRs={testPLRs}
            loaded={buildLoaded && testLoaded}
          />
        </GridItem>
        <GridItem span={6}>
          <ReleaseHealthCard namespace={namespace} />
        </GridItem>
        <GridItem span={6}>
          <IssuesCard namespace={namespace} />
        </GridItem>
        <GridItem span={12}>
          <MintmakerCard />
        </GridItem>
      </Grid>
    </PageSection>
  );
};

export default NamespaceOverviewTab;
