import { configure, screen } from '@testing-library/react';
import { formikRenderer } from '../../../utils/test-utils';
import { ComponentRelation } from '../ComponentRelationForm';
import { ComponentRelationNudgeType } from '../type';

configure({ testIdAttribute: 'id' });

const defaultRelation = {
  source: 'asdf',
  target: ['asd'],
  nudgeType: ComponentRelationNudgeType.NUDGES,
  mode: 'immediate' as const,
};

describe('ComponentRelationForm', () => {
  it('should render component relation form', () => {
    formikRenderer(
      <ComponentRelation
        index={0}
        componentNames={['asdf', 'asd']}
        sortedGroupedComponents={{ app: ['asdf', 'asd'] }}
        componentGroupNames={[]}
        removeProps={{
          disableRemove: true,
          onRemove: jest.fn(),
        }}
      />,
      {
        relations: [defaultRelation],
      },
    );
    expect(screen.getAllByTestId('toggle-component-menu')).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Nudges' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nudged by' })).toBeInTheDocument();
  });

  it('should render selected targets as label chips', () => {
    formikRenderer(
      <ComponentRelation
        index={0}
        componentNames={['comp-a', 'comp-b', 'comp-c']}
        sortedGroupedComponents={{ app: ['comp-a', 'comp-b', 'comp-c'] }}
        componentGroupNames={[]}
        removeProps={{
          disableRemove: false,
          onRemove: jest.fn(),
        }}
      />,
      {
        relations: [
          {
            source: 'comp-a',
            target: ['comp-b', 'comp-c'],
            nudgeType: ComponentRelationNudgeType.NUDGES,
            mode: 'immediate' as const,
          },
        ],
      },
    );
    expect(screen.getByText('comp-b')).toBeInTheDocument();
    expect(screen.getByText('comp-c')).toBeInTheDocument();
  });

  it('should render toggle group with nudge type', () => {
    formikRenderer(
      <ComponentRelation
        index={0}
        componentNames={['a', 'b']}
        sortedGroupedComponents={{ app: ['a', 'b'] }}
        componentGroupNames={[]}
        removeProps={{
          disableRemove: false,
          onRemove: jest.fn(),
        }}
      />,
      {
        relations: [
          { source: 'a', target: ['b'], nudgeType: ComponentRelationNudgeType.NUDGES, mode: 'immediate' as const },
        ],
      },
    );
    expect(screen.getByRole('button', { name: 'Nudges' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nudged by' })).toBeInTheDocument();
  });

  it('renders mode toggle buttons', () => {
    formikRenderer(
      <ComponentRelation
        index={0}
        componentNames={['a', 'b']}
        sortedGroupedComponents={{ app: ['a', 'b'] }}
        componentGroupNames={[]}
        removeProps={{ disableRemove: false, onRemove: jest.fn() }}
      />,
      {
        relations: [
          { source: 'a', target: ['b'], nudgeType: ComponentRelationNudgeType.NUDGES, mode: 'immediate' as const },
        ],
      },
    );
    expect(screen.getByRole('button', { name: 'Immediate' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Validated' })).toBeInTheDocument();
  });

  it('shows gating group dropdown when mode is validated', () => {
    formikRenderer(
      <ComponentRelation
        index={0}
        componentNames={['a', 'b']}
        sortedGroupedComponents={{ app: ['a', 'b'] }}
        componentGroupNames={['group-1', 'group-2']}
        removeProps={{ disableRemove: false, onRemove: jest.fn() }}
      />,
      {
        relations: [
          { source: 'a', target: ['b'], nudgeType: ComponentRelationNudgeType.NUDGES, mode: 'validated' as const },
        ],
      },
    );
    expect(screen.getByText('Gating group')).toBeInTheDocument();
  });

  it('hides gating group dropdown when mode is immediate', () => {
    formikRenderer(
      <ComponentRelation
        index={0}
        componentNames={['a', 'b']}
        sortedGroupedComponents={{ app: ['a', 'b'] }}
        componentGroupNames={['group-1']}
        removeProps={{ disableRemove: false, onRemove: jest.fn() }}
      />,
      {
        relations: [
          { source: 'a', target: ['b'], nudgeType: ComponentRelationNudgeType.NUDGES, mode: 'immediate' as const },
        ],
      },
    );
    expect(screen.queryByText('Gating group')).not.toBeInTheDocument();
  });
});
