import { render, screen } from '@testing-library/react';
import { ComponentKind } from '../../../../types';
import { ComponentRelationStatusIcon } from '../ComponentRelationStatusIcon';

describe('ComponentRelationStatusIcon', () => {
  it('should render the icon if build nudge ref is present (legacy Component CR fallback)', () => {
    render(
      <ComponentRelationStatusIcon
        component={{ spec: { 'build-nudges-ref': ['cmp'] } } as ComponentKind}
      />,
    );
    expect(screen.queryByAltText('Component is in a relationship icon')).toBeInTheDocument();
  });

  it('should render the icon if build nudge by is present (legacy Component CR fallback)', () => {
    render(
      <ComponentRelationStatusIcon
        component={{ status: { 'build-nudged-by': ['cmp'] } } as ComponentKind}
      />,
    );
    expect(screen.queryByAltText('Component is in a relationship icon')).toBeInTheDocument();
  });

  it('should not render the icon if build nudge by and build nudge ref is not present', () => {
    render(
      <ComponentRelationStatusIcon component={{ metadata: { name: 'cmp' } } as ComponentKind} />,
    );
    expect(screen.queryByAltText('Component is in a relationship icon')).not.toBeInTheDocument();
  });

  it('renders the icon when isInRelationship prop is true (ignores Component CR fields)', () => {
    render(
      <ComponentRelationStatusIcon
        component={{ metadata: { name: 'cmp' } } as ComponentKind}
        isInRelationship={true}
      />,
    );
    expect(screen.queryByAltText('Component is in a relationship icon')).toBeInTheDocument();
  });

  it('hides the icon when isInRelationship prop is false (even if CR fields are set)', () => {
    render(
      <ComponentRelationStatusIcon
        component={{ spec: { 'build-nudges-ref': ['cmp'] } } as ComponentKind}
        isInRelationship={false}
      />,
    );
    expect(screen.queryByAltText('Component is in a relationship icon')).not.toBeInTheDocument();
  });
});
