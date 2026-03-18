import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionGroup,
  Alert,
  AlertVariant,
  Button,
  Form,
  FormGroup,
  FormHelperText,
  HelperText,
  HelperTextItem,
  PageSection,
  TextInput,
} from '@patternfly/react-core';
import { Formik, FormikHelpers, useFormikContext } from 'formik';
import * as yup from 'yup';
import PageLayout from '~/components/PageLayout/PageLayout';
import { useDocumentTitle } from '~/hooks/useDocumentTitle';
import { USE_MOCK_DATA, mockGitOpsRepos } from '~/hooks/__mock__/mock-data';
import { useNamespace } from '~/shared/providers/Namespace';
import { GITOPS_LIST_PATH } from '~/routes/paths';
import { RouterParams } from '~/routes/utils';
import './GitOpsRegistration.scss';

interface GitOpsRegistrationFormValues {
  repoUrl: string;
  namespace: string;
  branch: string;
  path: string;
}

const validationSchema = yup.object().shape({
  repoUrl: yup
    .string()
    .required('Repository URL is required')
    .matches(
      /^https?:\/\/.+\/.+\/.+/,
      'Enter a valid Git repository URL (e.g., https://github.com/org/repo)',
    ),
  namespace: yup.string().required('Namespace is required'),
  branch: yup.string().default('main'),
  path: yup.string().default('/'),
});

const GitOpsRegistrationFormContent: React.FC = () => {
  const { values, errors, touched, handleChange, handleBlur, status } =
    useFormikContext<GitOpsRegistrationFormValues>();

  return (
    <div className="gitops-registration__form">
      <FormGroup label="Git repository URL" isRequired fieldId="repo-url">
        <TextInput
          id="repo-url"
          name="repoUrl"
          type="url"
          placeholder="https://github.com/your-org/your-gitops-repo"
          value={values.repoUrl}
          onChange={handleChange}
          onBlur={handleBlur}
          validated={touched.repoUrl && errors.repoUrl ? 'error' : 'default'}
          data-test="gitops-repo-url"
        />
        {touched.repoUrl && errors.repoUrl ? (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">{errors.repoUrl}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        ) : (
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                The Git repository containing your tenant configuration (applications, components,
                integration tests, release plans, RBAC).
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>

      <FormGroup label="Target namespace" isRequired fieldId="namespace">
        <TextInput
          id="namespace"
          name="namespace"
          value={values.namespace}
          onChange={handleChange}
          onBlur={handleBlur}
          validated={touched.namespace && errors.namespace ? 'error' : 'default'}
          data-test="gitops-namespace"
        />
        {touched.namespace && errors.namespace ? (
          <FormHelperText>
            <HelperText>
              <HelperTextItem variant="error">{errors.namespace}</HelperTextItem>
            </HelperText>
          </FormHelperText>
        ) : (
          <FormHelperText>
            <HelperText>
              <HelperTextItem>
                The Kubernetes namespace where resources from this repository will be deployed.
              </HelperTextItem>
            </HelperText>
          </FormHelperText>
        )}
      </FormGroup>

      <FormGroup label="Branch" fieldId="branch">
        <TextInput
          id="branch"
          name="branch"
          placeholder="main"
          value={values.branch}
          onChange={handleChange}
          onBlur={handleBlur}
          data-test="gitops-branch"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The Git branch to track. Defaults to &quot;main&quot;.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      <FormGroup label="Path" fieldId="path">
        <TextInput
          id="path"
          name="path"
          placeholder="/"
          value={values.path}
          onChange={handleChange}
          onBlur={handleBlur}
          data-test="gitops-path"
        />
        <FormHelperText>
          <HelperText>
            <HelperTextItem>
              The path within the repository where the tenant configuration resides. Defaults to the
              repository root.
            </HelperTextItem>
          </HelperText>
        </FormHelperText>
      </FormGroup>

      {status?.submitError && (
        <Alert variant={AlertVariant.danger} title="Registration failed" isInline>
          {status.submitError}
        </Alert>
      )}

      <Alert
        variant={AlertVariant.info}
        title="What happens next?"
        isInline
        className="pf-v5-u-mt-md"
      >
        After registration, the GitOps Registration Service will validate your repository, provision
        the namespace if needed, and configure ArgoCD for continuous synchronization. Changes pushed
        to your repository will be automatically applied to the target namespace.
      </Alert>
    </div>
  );
};

export const GitOpsRegistrationForm: React.FC = () => {
  const { gitopsRepoName } = useParams<RouterParams>();
  const isEditMode = !!gitopsRepoName;

  useDocumentTitle(
    isEditMode ? `Edit ${gitopsRepoName} | Konflux` : 'Register GitOps Repository | Konflux',
  );
  const navigate = useNavigate();
  const namespace = useNamespace();

  const existingRepo = React.useMemo(() => {
    if (!isEditMode || !USE_MOCK_DATA) return null;
    return mockGitOpsRepos.find((r) => r.name === gitopsRepoName) || null;
  }, [isEditMode, gitopsRepoName]);

  const initialValues: GitOpsRegistrationFormValues = {
    repoUrl: existingRepo?.repoUrl || '',
    namespace: existingRepo?.namespace || namespace || '',
    branch: 'main',
    path: '/',
  };

  const handleSubmit = React.useCallback(
    (
      values: GitOpsRegistrationFormValues,
      formikHelpers: FormikHelpers<GitOpsRegistrationFormValues>,
    ) => {
      // TODO: Call the GitOps Registration Service API
      // eslint-disable-next-line no-console
      console.log(isEditMode ? 'Updating GitOps repo:' : 'Registering GitOps repo:', values);

      // Simulate API call for now
      setTimeout(() => {
        formikHelpers.setSubmitting(false);
        navigate(GITOPS_LIST_PATH.createPath({ workspaceName: namespace }));
      }, 1000);
    },
    [namespace, navigate, isEditMode],
  );

  const handleCancel = React.useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const breadcrumbs = [
    {
      name: 'GitOps Registration',
      path: namespace ? GITOPS_LIST_PATH.createPath({ workspaceName: namespace }) : '#',
    },
    { name: isEditMode ? `Edit ${gitopsRepoName}` : 'Register repository', path: '#' },
  ];

  return (
    <PageLayout
      title={isEditMode ? `Edit ${gitopsRepoName}` : 'Register GitOps Repository'}
      breadcrumbs={breadcrumbs}
    >
      <PageSection>
        <Formik<GitOpsRegistrationFormValues>
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {(formikProps) => (
            <Form onSubmit={formikProps.handleSubmit}>
              <GitOpsRegistrationFormContent />
              <ActionGroup className="pf-v5-u-mt-lg pf-v5-u-ml-lg">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={formikProps.isSubmitting}
                  isDisabled={formikProps.isSubmitting || !formikProps.isValid || !formikProps.dirty}
                  data-test="gitops-register-submit"
                >
                  {isEditMode ? 'Save' : 'Register'}
                </Button>
                <Button variant="link" onClick={handleCancel} data-test="gitops-register-cancel">
                  Cancel
                </Button>
              </ActionGroup>
            </Form>
          )}
        </Formik>
      </PageSection>
    </PageLayout>
  );
};
