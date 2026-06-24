import { configure, screen } from '@testing-library/react';
import { formikRenderer } from '../../../utils/test-utils';
import { ComponentRelation } from '../ComponentRelationForm';
import { ComponentRelationNudgeType } from '../type';

configure({ testIdAttribute: 'id' });

describe('ComponentRelationForm', () => {
  it('should render component relation form', () => {
    formikRenderer(
      <ComponentRelation
        index={0}
        componentNames={['asdf', 'asd']}
        sortedGroupedComponents={{ app: ['asdf', 'asd'] }}
        removeProps={{
          disableRemove: true,
          onRemove: jest.fn(),
        }}
      />,
      {
        relations: [
          { source: 'asdf', target: ['asd'], nudgeType: ComponentRelationNudgeType.NUDGES },
        ],
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
        removeProps={{
          disableRemove: false,
          onRemove: jest.fn(),
        }}
      />,
      {
        relations: [
          { source: 'a', target: ['b'], nudgeType: ComponentRelationNudgeType.NUDGES },
        ],
      },
    );
    expect(screen.getByRole('button', { name: 'Nudges' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Nudged by' })).toBeInTheDocument();
  });
});
