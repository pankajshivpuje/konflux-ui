import * as React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ActionGroup,
  Alert,
  AlertVariant,
  Button,
  Checkbox,
  Form,
  FormGroup,
  FormHelperText,
  FormSelect,
  FormSelectOption,
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
import { APPLICATION_LIST_PATH, NAMESPACE_LIST_PATH } from '~/routes/paths';
import { RouterParams } from '~/routes/utils';
import './GitOpsRegistration.scss';

interface GitOpsRegistrationFormValues {
  repoUrl: string;
  branch: string;
  path: string;
  isPrivateRepo: boolean;
  secretName: string;
  authType: string;
  authValue: string;
}

const authTypeOptions = [
  { value: '', label: 'Select authentication type', isPlaceholder: true },
  { value: 'personal-token', label: 'Personal access token' },
  { value: 'ssh-key', label: 'SSH key' },
  { value: 'oauth-token', label: 'OAuth token' },
];

const authValueLabels: Record<string, { label: string; placeholder: string; helpText: string }> = {
  'personal-token': {
    label: 'Personal access token',
    placeholder: 'ghp_xxxxxxxxxxxxxxxxxxxx',
    helpText:
      'Enter the personal access token generated from your Git provider. This token must have read access to the repository.',
  },
  'ssh-key': {
    label: 'SSH private key',
    placeholder: '-----BEGIN OPENSSH PRIVATE KEY-----',
    helpText:
      'Paste the SSH private key used to authenticate with the repository. The corresponding public key must be added to your Git provider.',
  },
  'oauth-token': {
    label: 'OAuth token',
    placeholder: 'gho_xxxxxxxxxxxxxxxxxxxx',
    helpText:
      'Enter the OAuth token issued by your Git provider. This token must have the necessary scopes to access the repository.',
  },
};

const validationSchema = yup.object().shape({
  repoUrl: yup
    .string()
    .required('Repository URL is required')
    .matches(
      /^https?:\/\/.+\/.+\/.+/,
      'Enter a valid Git repository URL (e.g., https://github.com/org/repo)',
    ),
  branch: yup.string().default('main'),
  path: yup.string().default('/'),
  isPrivateRepo: yup.boolean().default(false),
  secretName: yup.string().when('isPrivateRepo', {
    is: true,
    then: (schema) => schema.required('Secret name is required for private repositories'),
  }),
  authType: yup.string().when('isPrivateRepo', {
    is: true,
    then: (schema) => schema.required('Authentication type is required for private repositories'),
  }),
  authValue: yup.string().when(['isPrivateRepo', 'authType'], {
    is: (isPrivate: boolean, authType: string) => isPrivate && !!authType,
    then: (schema) => schema.required('Authentication credential is required'),
  }),
});

const GitOpsRegistrationFormContent: React.FC<{ namespace: string }> = ({ namespace }) => {
  const { values, errors, touched, handleBlur, setFieldValue, status } =
    useFormikContext<GitOpsRegistrationFormValues>();

  return (
    <div className="gitops-registration__form">
      <Alert
        variant="custom"
        title="One-time setup"
        isInline
        className="pf-v5-u-mb-md"
      >
        {`This registration process maps your GitOps repository to the "${namespace}" namespace. Once registered, all resources from your repository will be deployed to this namespace.`}
      </Alert>

      <FormGroup label="Git repository URL" isRequired fieldId="repo-url">
        <TextInput
          id="repo-url"
          name="repoUrl"
          type="url"
          placeholder="https://github.com/your-org/your-gitops-repo"
          value={values.repoUrl}
          onChange={(_event, value) => void setFieldValue('repoUrl', value)}
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

      <FormGroup fieldId="is-private-repo">
        <Checkbox
          id="is-private-repo"
          name="isPrivateRepo"
          label="Private repository"
          description="Select this if the Git repository requires authentication to access."
          isChecked={values.isPrivateRepo}
          onChange={(_event, checked) => {
            void setFieldValue('isPrivateRepo', checked);
            if (!checked) {
              void setFieldValue('secretName', '');
              void setFieldValue('authType', '');
              void setFieldValue('authValue', '');
            }
          }}
          data-test="gitops-private-repo"
        />
      </FormGroup>

      {values.isPrivateRepo && (
        <div className="pf-v5-u-ml-lg pf-v5-u-mt-sm">
          <FormGroup label="Secret name" isRequired fieldId="secret-name">
            <TextInput
              id="secret-name"
              name="secretName"
              placeholder="my-git-secret"
              value={values.secretName}
              onChange={(_event, value) => void setFieldValue('secretName', value)}
              onBlur={handleBlur}
              validated={touched.secretName && errors.secretName ? 'error' : 'default'}
              data-test="gitops-secret-name"
            />
            {touched.secretName && errors.secretName ? (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">{errors.secretName}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            ) : (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    The name of the Kubernetes Secret that contains the credentials for accessing this
                    repository.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>

          <FormGroup label="Authentication type" isRequired fieldId="auth-type">
            <FormSelect
              id="auth-type"
              name="authType"
              value={values.authType}
              onChange={(_event, value) => {
                void setFieldValue('authType', value);
                void setFieldValue('authValue', '');
              }}
              onBlur={handleBlur}
              validated={touched.authType && errors.authType ? 'error' : 'default'}
              data-test="gitops-auth-type"
            >
              {authTypeOptions.map((option) => (
                <FormSelectOption
                  key={option.value}
                  value={option.value}
                  label={option.label}
                  isPlaceholder={option.isPlaceholder}
                />
              ))}
            </FormSelect>
            {touched.authType && errors.authType ? (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem variant="error">{errors.authType}</HelperTextItem>
                </HelperText>
              </FormHelperText>
            ) : (
              <FormHelperText>
                <HelperText>
                  <HelperTextItem>
                    Choose how the service authenticates with your Git provider. The selected type
                    must match the credentials stored in the secret.
                  </HelperTextItem>
                </HelperText>
              </FormHelperText>
            )}
          </FormGroup>

          {values.authType && authValueLabels[values.authType] && (
            <FormGroup
              label={authValueLabels[values.authType].label}
              isRequired
              fieldId="auth-value"
            >
              <TextInput
                id="auth-value"
                name="authValue"
                type="text"
                placeholder={authValueLabels[values.authType].placeholder}
                value={values.authValue}
                onChange={(_event, value) => void setFieldValue('authValue', value)}
                onBlur={handleBlur}
                validated={touched.authValue && errors.authValue ? 'error' : 'default'}
                data-test="gitops-auth-value"
              />
              {touched.authValue && errors.authValue ? (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem variant="error">{errors.authValue}</HelperTextItem>
                  </HelperText>
                </FormHelperText>
              ) : (
                <FormHelperText>
                  <HelperText>
                    <HelperTextItem>
                      {authValueLabels[values.authType].helpText}
                    </HelperTextItem>
                  </HelperText>
                </FormHelperText>
              )}
            </FormGroup>
          )}
        </div>
      )}

      <FormGroup label="Branch" fieldId="branch">
        <TextInput
          id="branch"
          name="branch"
          placeholder="main"
          value={values.branch}
          onChange={(_event, value) => void setFieldValue('branch', value)}
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
          onChange={(_event, value) => void setFieldValue('path', value)}
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
    branch: 'main',
    path: '/',
    isPrivateRepo: false,
    secretName: '',
    authType: '',
    authValue: '',
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
        navigate(NAMESPACE_LIST_PATH.createPath({} as never));
      }, 1000);
    },
    [namespace, navigate, isEditMode],
  );

  const handleCancel = React.useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const breadcrumbs = [
    {
      name: 'Namespaces',
      path: NAMESPACE_LIST_PATH.createPath({} as never),
    },
    ...(namespace
      ? [
          {
            name: namespace,
            path: APPLICATION_LIST_PATH.createPath({ workspaceName: namespace }),
          },
        ]
      : []),
    { name: isEditMode ? `Edit ${gitopsRepoName}` : 'Register GitOps Repository', path: '#' },
  ];

  return (
    <PageLayout
      title={isEditMode ? `Edit ${gitopsRepoName}` : 'Register GitOps Repository'}
      description={
        isEditMode
          ? undefined
          : 'Connect your GitOps repository to Konflux. This will create a dedicated namespace and configure continuous deployment for your team\'s applications and components.'
      }
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
              <GitOpsRegistrationFormContent namespace={namespace} />
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
