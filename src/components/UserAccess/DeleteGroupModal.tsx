import React from 'react';
import {
  Modal,
  Stack,
  StackItem,
  TextContent,
  Text,
  TextList,
  TextListItem,
  Alert,
  AlertVariant,
  Button,
  ButtonType,
  ButtonVariant,
  ModalVariant,
} from '@patternfly/react-core';
import { USE_MOCK_DATA } from '../../hooks/__mock__/mock-data';
import { RawComponentProps } from '../modal/createModalLauncher';
import { KonfluxGroup } from './group-utils';
import { deleteGroup } from './UserAccessForm/form-utils';

type Props = RawComponentProps & {
  group: KonfluxGroup;
};

export const DeleteGroupModal: React.FC<React.PropsWithChildren<Props>> = ({
  group,
  onClose,
  modalProps,
}) => {
  const [error, setError] = React.useState<string>();
  const [submitting, setSubmitting] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setError(null);
      try {
        if (USE_MOCK_DATA) {
          await new Promise((resolve) => setTimeout(resolve, 300));
        } else {
          await deleteGroup(group.roleBindings);
        }
        onClose(null, { submitClicked: true });
      } catch (err) {
        setError((err as { message: string }).message || String(err));
        setSubmitting(false);
      }
    },
    [onClose, group],
  );

  return (
    <Modal {...modalProps} variant={ModalVariant.small}>
      <Stack hasGutter>
        <StackItem>
          <TextContent>
            <Text data-test="description">
              Delete group <strong>{group.name}</strong>? This will revoke access for{' '}
              {group.members.length} {group.members.length === 1 ? 'user' : 'users'}:
            </Text>
            <TextList>
              {group.members.map((member) => (
                <TextListItem key={member}>{member}</TextListItem>
              ))}
            </TextList>
          </TextContent>
        </StackItem>
        <StackItem>
          {error && (
            <Alert isInline variant={AlertVariant.danger} title="An error occurred">
              {error}
            </Alert>
          )}
          <Button
            type={ButtonType.submit}
            variant={ButtonVariant.danger}
            isLoading={submitting}
            onClick={handleSubmit}
            isDisabled={submitting}
            data-test="delete-group-submit"
          >
            Delete
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
