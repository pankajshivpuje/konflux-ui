import * as React from 'react';
import {
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalProps as PFModalProps,
} from '@patternfly/react-core';

export type ModalProps = Omit<PFModalProps, 'children' | 'ref'> & {
  title?: React.ReactNode;
  titleIconVariant?: 'success' | 'danger' | 'warning' | 'info' | 'custom' | React.ComponentType;
  description?: React.ReactNode;
  hasNoBodyWrapper?: boolean;
  bodyAriaLabel?: string;
  actions?: React.ReactNode[];
};

type ModalComponentProps = Omit<ModalProps, 'isOpen' | 'appendTo'> & {
  'data-test': string;
};

type OnModalClose<D = unknown> = (obj?: D) => void;

export type ComponentProps<D = unknown> = {
  onClose?: (event?: KeyboardEvent | React.MouseEvent, obj?: D) => void;
};

export type RawComponentProps<D = unknown> = ComponentProps<D> & { modalProps?: ModalProps };

export type ModalLauncher<Result = Record<string, unknown>> = (
  onClose: OnModalClose<Result>,
) => React.ReactElement;

const CUSTOM_MODAL_KEYS = ['title', 'titleIconVariant', 'description', 'hasNoBodyWrapper', 'bodyAriaLabel', 'actions'] as const;

export const extractModalProps = (
  modalProps: ModalProps,
): { headerProps: { title?: React.ReactNode; titleIconVariant?: ModalProps['titleIconVariant']; description?: React.ReactNode }; rest: Omit<PFModalProps, 'children' | 'ref'> } => {
  const rest = { ...modalProps };
  for (const key of CUSTOM_MODAL_KEYS) {
    delete rest[key];
  }
  return {
    headerProps: {
      title: modalProps?.title,
      titleIconVariant: modalProps?.titleIconVariant,
      description: modalProps?.description,
    },
    rest: rest as Omit<PFModalProps, 'children' | 'ref'>,
  };
};

export const createRawModalLauncher =
  <D extends Record<string, unknown>, P extends ComponentProps<D>>(
    Component: React.ComponentType<React.PropsWithChildren<P & { modalProps?: ModalProps }>>,
    modalProps: ModalComponentProps,
  ) =>
  (componentProps?: P): ModalLauncher<D> =>
  (onModalClose) => {
    const { onClose, ...restModalProps } = modalProps;
    const handleClose = (event: KeyboardEvent | React.MouseEvent, obj?: unknown) => {
      onClose?.(event);
      onModalClose((obj ?? {}) as D);
    };

    return (
      <Component
        {...componentProps}
        modalProps={{
          'aria-label': 'modal',
          ...restModalProps,
          isOpen: true,
          onClose: handleClose,
          appendTo: () => document.querySelector('#hacDev-modal-container'),
        }}
        onClose={handleClose}
      />
    );
  };

export const createModalLauncher = <D extends Record<string, unknown>, P extends ComponentProps<D>>(
  Component: React.ComponentType<React.PropsWithChildren<P>>,
  inModalProps: ModalComponentProps,
) =>
  createRawModalLauncher(
    ({ modalProps, ...props }: P & { modalProps?: ModalProps }) => {
      const {
        title,
        titleIconVariant,
        description,
        hasNoBodyWrapper,
        bodyAriaLabel,
        actions,
        ...rest
      } = modalProps ?? {};
      const content = (
        // eslint-disable-next-line
        <Component {...(props as any)} />
      );
      return (
        <Modal {...rest}>
          {title && (
            <ModalHeader title={title} titleIconVariant={titleIconVariant} description={description} />
          )}
          {hasNoBodyWrapper ? content : <ModalBody aria-label={bodyAriaLabel}>{content}</ModalBody>}
          {actions?.length > 0 && <ModalFooter>{actions}</ModalFooter>}
        </Modal>
      );
    },
    inModalProps,
  );
