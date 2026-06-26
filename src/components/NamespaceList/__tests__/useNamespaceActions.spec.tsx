import { renderHook } from '@testing-library/react';
import { GitOpsRegistrationInfo } from '~/hooks/useGitOpsRegistration';
import { NamespaceKind } from '~/types';
import { mockAccessReviewUtil } from '../../../unit-test-utils/mock-access-review';
import { useNamespaceActions } from '../useNamespaceActions';

// Mock the modal launcher
const mockShowModal = jest.fn();
jest.mock('../../modal/ModalProvider', () => ({
  useModalLauncher: jest.fn(() => mockShowModal),
}));
// Mock the checkReviewAccesses function
const mockCheckReviewAccesses = mockAccessReviewUtil('checkReviewAccesses');

// Mock useGitOpsRegistration
const mockGitOpsInfo: GitOpsRegistrationInfo = { isRegistered: false };
jest.mock('~/hooks/useGitOpsRegistration', () => ({
  useGitOpsRegistration: jest.fn(() => [mockGitOpsInfo, true, undefined]),
}));
const { useGitOpsRegistration } = jest.requireMock('~/hooks/useGitOpsRegistration');

const mockNamespace: NamespaceKind = {
  apiVersion: 'v1',
  kind: 'Namespace',
  metadata: {
    name: 'test-namespace',
    creationTimestamp: '2023-01-01T00:00:00Z',
  },
  spec: {},
  status: {},
};

describe('useNamespaceActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock responses
    mockCheckReviewAccesses.mockResolvedValue(true);
    (useGitOpsRegistration as jest.Mock).mockReturnValue([
      { isRegistered: false },
      true,
      undefined,
    ]);
  });

  it('should return actions array, loading state, and toggle function', () => {
    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    expect(result.current).toHaveLength(3);
    expect(Array.isArray(result.current[0])).toBe(true);
    expect(typeof result.current[1]).toBe('boolean');
    expect(typeof result.current[2]).toBe('function');
  });

  it('should return register gitops repo action when not registered', () => {
    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    const gitopsAction = result.current[0][0];
    expect(gitopsAction.id).toBe('register-gitops-repo-test-namespace');
    expect(gitopsAction.label).toBe('Register GitOps Repo');
    expect(gitopsAction.cta).toEqual({
      href: '/ns/test-namespace/gitops/register',
    });
  });

  it('should return edit gitops registration action when registered', () => {
    (useGitOpsRegistration as jest.Mock).mockReturnValue([
      { isRegistered: true, repoName: 'my-gitops-repo' },
      true,
      undefined,
    ]);

    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    const gitopsAction = result.current[0][0];
    expect(gitopsAction.id).toBe('edit-gitops-registration-test-namespace');
    expect(gitopsAction.label).toBe('Edit GitOps Registration');
    expect(gitopsAction.cta).toEqual({
      href: '/ns/test-namespace/gitops/my-gitops-repo/edit',
    });
  });

  it('should return manage visibility action enabled when user has permissions', () => {
    mockCheckReviewAccesses.mockResolvedValue(true);

    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    // Manage visibility is the second action
    expect(result.current[0][1]).toEqual({
      cta: expect.any(Function),
      id: 'manage-visibility-test-namespace',
      label: 'Manage visibility',
      disabled: false,
      disabledTooltip: "You don't have permission to manage namespace visibility",
    });
  });

  it('should trigger permission check when toggle function is called', async () => {
    mockCheckReviewAccesses.mockResolvedValue(true);

    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    // Call the toggle function to trigger permission check
    result.current[2](true);

    // Wait for the permission check to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockCheckReviewAccesses).toHaveBeenCalledTimes(1);
  });

  it('should disable action when user lacks permissions', async () => {
    mockCheckReviewAccesses.mockResolvedValue(false);

    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    // Trigger permission check
    result.current[2](true);

    // Wait for the permission check to complete
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Manage visibility is the second action
    expect(result.current[0][1].disabled).toBe(true);
    expect(result.current[0][1].disabledTooltip).toBe(
      "You don't have permission to manage namespace visibility",
    );
  });

  it('should show loading state while checking permissions', async () => {
    // Mock a delayed response to simulate loading
    mockCheckReviewAccesses.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
    );

    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    // Trigger permission check
    result.current[2](true);

    // Check loading state - need to wait for the async operation to start
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(result.current[1]).toBe(true); // isChecking should be true
  });

  it('should call modal launcher when action is triggered with permissions', async () => {
    mockCheckReviewAccesses.mockResolvedValue(true);

    const { result } = renderHook(() => useNamespaceActions(mockNamespace));

    // Trigger permission check first
    result.current[2](true);
    await new Promise((resolve) => setTimeout(resolve, 0));

    // Now call the manage visibility action (second action)
    const action = result.current[0][1];
    if (typeof action.cta === 'function') {
      action.cta();
    }

    expect(mockShowModal).toHaveBeenCalledTimes(1);
  });

  it('should handle different namespaces correctly', () => {
    const namespace1: NamespaceKind = {
      ...mockNamespace,
      metadata: { ...mockNamespace.metadata, name: 'namespace-1' },
    };

    const namespace2: NamespaceKind = {
      ...mockNamespace,
      metadata: { ...mockNamespace.metadata, name: 'namespace-2' },
    };

    const { result: result1 } = renderHook(() => useNamespaceActions(namespace1));
    const { result: result2 } = renderHook(() => useNamespaceActions(namespace2));

    // Check gitops action IDs
    expect(result1.current[0][0].id).toBe('register-gitops-repo-namespace-1');
    expect(result2.current[0][0].id).toBe('register-gitops-repo-namespace-2');

    // Check manage visibility action IDs
    expect(result1.current[0][1].id).toBe('manage-visibility-namespace-1');
    expect(result2.current[0][1].id).toBe('manage-visibility-namespace-2');
  });

  it('should generate correct gitops registration paths for different namespaces', () => {
    const namespace1: NamespaceKind = {
      ...mockNamespace,
      metadata: { ...mockNamespace.metadata, name: 'my-team' },
    };

    const { result } = renderHook(() => useNamespaceActions(namespace1));

    const gitopsAction = result.current[0][0];
    expect(gitopsAction.cta).toEqual({
      href: '/ns/my-team/gitops/register',
    });
  });
});
