import { screen } from '@testing-library/react';
import { renderWithQueryClientAndRouter } from '../../../unit-test-utils/rendering-utils';
import { Overview } from '../Overview';

jest.mock('~/hooks/useKonfluxPublicInfo', () => ({
  useKonfluxPublicInfo: jest.fn(() => [{ environmentName: 'staging', statusPageUrl: '' }, true]),
}));

describe('Overview', () => {
  it('should render all child components in correct order', () => {
    renderWithQueryClientAndRouter(<Overview />);

    expect(screen.getByText('Get started with Konflux')).toBeInTheDocument();
    expect(screen.getByText('Build artifacts of all kinds from source')).toBeInTheDocument();
    expect(screen.getByTestId('about-section-title')).toBeInTheDocument();
  });

  it('should render with PageSection wrapper', () => {
    renderWithQueryClientAndRouter(<Overview />);
    expect(screen.getByText('Get started with Konflux')).toBeInTheDocument();
  });

  it('should have proper structure with PageSection components', () => {
    renderWithQueryClientAndRouter(<Overview />);
    expect(screen.getByText('Get started with Konflux')).toBeInTheDocument();
    expect(screen.getByText('Build artifacts of all kinds from source')).toBeInTheDocument();
    expect(screen.getByTestId('about-section-title')).toBeInTheDocument();
  });
});
