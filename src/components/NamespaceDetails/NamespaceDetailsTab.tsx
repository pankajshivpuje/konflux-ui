import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardTitle,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  Flex,
  FlexItem,
  Label,
  PageSection,
  Skeleton,
  Text,
  TextContent,
  Timestamp,
} from '@patternfly/react-core';
import { useApplications } from '~/hooks/useApplications';
import { useGitOpsRegistration } from '~/hooks/useGitOpsRegistration';
import { useNamespaceInfo } from '~/shared/providers/Namespace';

const NamespaceDetailsTab: React.FC = () => {
  const { workspaceName } = useParams<{ workspaceName: string }>();
  const { namespaces, namespacesLoaded } = useNamespaceInfo();

  const namespaceResource = React.useMemo(
    () =>
      namespaces?.find((ns) => ns.metadata?.name === workspaceName),
    [namespaces, workspaceName],
  );

  const [gitopsInfo, gitopsLoaded] = useGitOpsRegistration(workspaceName);
  const [applications, applicationsLoaded] = useApplications(workspaceName);

  const visibility =
    namespaceResource?.metadata?.labels?.['konflux.dev/visibility'] || 'private';

  if (!namespacesLoaded) {
    return (
      <PageSection>
        <Skeleton height="300px" />
      </PageSection>
    );
  }

  return (
    <PageSection>
      <Flex direction={{ default: 'column' }} gap={{ default: 'gapLg' }}>
        <FlexItem>
          <Card data-test="namespace-metadata-card">
            <CardTitle>Namespace Metadata</CardTitle>
            <CardBody>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>Name</DescriptionListTerm>
                  <DescriptionListDescription>
                    {namespaceResource?.metadata?.name ?? workspaceName}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {namespaceResource?.metadata?.uid && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>UID</DescriptionListTerm>
                    <DescriptionListDescription>
                      {namespaceResource.metadata.uid}
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {namespaceResource?.metadata?.creationTimestamp && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Created</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Timestamp date={new Date(namespaceResource.metadata.creationTimestamp)} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                <DescriptionListGroup>
                  <DescriptionListTerm>Status</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label
                      color={
                        namespaceResource?.status?.phase === 'Active' ? 'green' : 'grey'
                      }
                      isCompact
                    >
                      {String(namespaceResource?.status?.phase ?? 'Unknown')}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {namespaceResource?.metadata?.labels &&
                  Object.keys(namespaceResource.metadata.labels).length > 0 && (
                    <DescriptionListGroup>
                      <DescriptionListTerm>Labels</DescriptionListTerm>
                      <DescriptionListDescription>
                        <Flex gap={{ default: 'gapSm' }} flexWrap={{ default: 'wrap' }}>
                          {Object.entries(namespaceResource.metadata.labels).map(
                            ([key, value]) => (
                              <FlexItem key={key}>
                                <Label isCompact>
                                  {key}={String(value)}
                                </Label>
                              </FlexItem>
                            ),
                          )}
                        </Flex>
                      </DescriptionListDescription>
                    </DescriptionListGroup>
                  )}
              </DescriptionList>
            </CardBody>
          </Card>
        </FlexItem>

        <FlexItem>
          <Card data-test="namespace-operational-card">
            <CardTitle>Operational Details</CardTitle>
            <CardBody>
              <DescriptionList isHorizontal>
                <DescriptionListGroup>
                  <DescriptionListTerm>Visibility</DescriptionListTerm>
                  <DescriptionListDescription>
                    <Label
                      color={visibility === 'public' ? 'blue' : 'grey'}
                      isCompact
                    >
                      {visibility}
                    </Label>
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>Applications</DescriptionListTerm>
                  <DescriptionListDescription>
                    {applicationsLoaded ? (
                      applications.length
                    ) : (
                      <Skeleton width="30px" />
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                <DescriptionListGroup>
                  <DescriptionListTerm>GitOps Registration</DescriptionListTerm>
                  <DescriptionListDescription>
                    {!gitopsLoaded ? (
                      <Skeleton width="80px" />
                    ) : gitopsInfo.isRegistered ? (
                      <Label color="green" isCompact>
                        Registered
                      </Label>
                    ) : (
                      <TextContent>
                        <Text component="small">Not registered</Text>
                      </TextContent>
                    )}
                  </DescriptionListDescription>
                </DescriptionListGroup>
                {gitopsInfo.isRegistered && gitopsInfo.repoUrl && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>GitOps Repo URL</DescriptionListTerm>
                    <DescriptionListDescription>
                      <a href={gitopsInfo.repoUrl} target="_blank" rel="noopener noreferrer">
                        {gitopsInfo.repoUrl}
                      </a>
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {gitopsInfo.isRegistered && gitopsInfo.registeredAt && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Registration Date</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Timestamp date={new Date(gitopsInfo.registeredAt)} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
                {gitopsInfo.isRegistered && gitopsInfo.lastSynced && (
                  <DescriptionListGroup>
                    <DescriptionListTerm>Last Synced</DescriptionListTerm>
                    <DescriptionListDescription>
                      <Timestamp date={new Date(gitopsInfo.lastSynced)} />
                    </DescriptionListDescription>
                  </DescriptionListGroup>
                )}
              </DescriptionList>
            </CardBody>
          </Card>
        </FlexItem>
      </Flex>
    </PageSection>
  );
};

export default NamespaceDetailsTab;
