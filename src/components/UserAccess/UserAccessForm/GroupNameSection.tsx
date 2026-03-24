import React from 'react';
import {
  FormGroup,
  FormHelperText,
  FormSection,
  HelperText,
  HelperTextItem,
  TextInput,
} from '@patternfly/react-core';
import { useField } from 'formik';
import { getFieldId } from '../../../shared/components/formik-fields/field-utils';

type Props = {
  disabled?: boolean;
};

export const GroupNameSection: React.FC<React.PropsWithChildren<Props>> = ({ disabled }) => {
  const [{ value, onChange, onBlur }, { error, touched }] = useField('groupName');
  const fieldId = getFieldId('groupName', 'input');
  const isValid = !touched || !error;

  return (
    <FormSection title="Group name">
      <FormGroup fieldId={fieldId} label="Group name" isRequired>
        <TextInput
          id={fieldId}
          data-test="group-name-input"
          name="groupName"
          type="text"
          placeholder="Enter group name"
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          isDisabled={disabled}
          validated={isValid ? 'default' : 'error'}
        />
        <FormHelperText>
          <HelperText>
            {!isValid ? (
              <HelperTextItem variant="error" hasIcon>
                {error}
              </HelperTextItem>
            ) : (
              <HelperTextItem>
                Lowercase alphanumeric and hyphens only (e.g., frontend-team).
              </HelperTextItem>
            )}
          </HelperText>
        </FormHelperText>
      </FormGroup>
    </FormSection>
  );
};
