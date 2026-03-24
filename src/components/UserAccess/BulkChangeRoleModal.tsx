import React from 'react';
import {
  Alert,
  AlertVariant,
  Button,
  ButtonType,
  ButtonVariant,
  FormGroup,
  FormSelect,
  FormSelectOption,
  Modal,
  ModalVariant,
  Stack,
  StackItem,
  Text,
  TextContent,
  TextList,
  TextListItem,
} from '@patternfly/react-core';
import { useRoleMap } from '../../hooks/useRole';
import { USE_MOCK_DATA } from '../../hooks/__mock__/mock-data';
import { RoleBinding, NamespaceRole } from '../../types';
import { RawComponentProps } from '../modal/createModalLauncher';
import { createRBs, deleteRB, UserAccessFormValues } from './UserAccessForm/form-utils';

type Props = RawComponentProps & {
  rbs: RoleBinding[];
};

export const BulkChangeRoleModal: React.FC<React.PropsWithChildren<Props>> = ({
  rbs,
  onClose,
  modalProps,
}) => {
  const [roleMap, roleMapLoaded] = useRoleMap();
  const [selectedRole, setSelectedRole] = React.useState<string>('');
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);

  const subjectNames = React.useMemo(
    () =>
      rbs.flatMap(
        (rb) =>
          rb.subjects?.filter((s) => s.kind === 'User').map((s) => s.name) ?? [],
      ),
    [rbs],
  );

  const roleItems = React.useMemo(() => {
    if (!roleMapLoaded || !roleMap?.roleMap) return [];
    return Object.entries(roleMap.roleMap).map(([key, value]) => ({
      key,
      value: value as string,
    }));
  }, [roleMap, roleMapLoaded]);

  const handleSubmit = React.useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      if (!selectedRole || !roleMap) return;

      setSubmitting(true);
      setError(null);

      const roleName = roleItems.find((r) => r.key === selectedRole)?.value as NamespaceRole;
      const namespace = rbs[0]?.metadata?.namespace;

      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          const values: UserAccessFormValues = {
            usernames: subjectNames,
            role: roleName,
            roleMap,
          };
          // Dry run
          for (const rb of rbs) {
            await deleteRB(rb, true);
          }
          await createRBs(values, namespace, true);
          // Actual
          for (const rb of rbs) {
            await deleteRB(rb);
          }
          await createRBs(values, namespace);
        }

        onClose(null, { submitClicked: true });
      } catch (err) {
        setError((err as { message: string }).message || String(err));
        setSubmitting(false);
      }
    },
    [selectedRole, roleMap, roleItems, rbs, subjectNames, onClose],
  );

  return (
    <Modal {...modalProps} variant={ModalVariant.small}>
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text>
              Change the role for <strong>{subjectNames.length}</strong>{' '}
              {subjectNames.length === 1 ? 'user' : 'users'}:
            </Text>
            <TextList>
              {subjectNames.map((u) => (
                <TextListItem key={u}>{u}</TextListItem>
              ))}
            </TextList>
          </TextContent>
        </StackItem>
        <StackItem>
          <FormGroup label="New role" isRequired fieldId="bulk-role-select">
            <FormSelect
              id="bulk-role-select"
              value={selectedRole}
              onChange={(_e, val) => setSelectedRole(val)}
              aria-label="Select new role"
              data-test="bulk-role-select"
            >
              <FormSelectOption key="" value="" label="Select a role" isDisabled />
              {roleItems.map((item) => (
                <FormSelectOption key={item.key} value={item.key} label={item.value} />
              ))}
            </FormSelect>
          </FormGroup>
        </StackItem>
        <StackItem>
          {error && (
            <Alert isInline variant={AlertVariant.danger} title="An error occurred">
              {error}
            </Alert>
          )}
          <Button
            type={ButtonType.submit}
            variant={ButtonVariant.primary}
            isLoading={submitting}
            onClick={handleSubmit}
            isDisabled={submitting || !selectedRole}
            data-test="bulk-change-role-submit"
          >
            Save
          </Button>
          <Button
            variant={ButtonVariant.link}
            onClick={() => onClose(null, { submitClicked: false })}
          >
            Cancel
          </Button>
        </StackItem>
      </Stack>
    </Modal>
  );
};
