import { renderHook } from '@testing-library/react-hooks';
import { useAllComponents, useComponents } from '../../../hooks/useComponents';
import { ComponentModel, NudgeConfigModel } from '../../../models';
import { useAccessReviewForModel } from '../../../utils/rbac';
import { useComponentRelationAction } from '../useComponentRelationAction';

jest.mock('../../../utils/rbac', () => ({ useAccessReviewForModel: jest.fn() }));
jest.mock('../../../hooks/useComponents', () => ({
  useComponents: jest.fn(),
  useAllComponents: jest.fn(),
}));

const mockUseComponents = useComponents as jest.Mock;
const mockUseAllComponents = useAllComponents as jest.Mock;
const mockUseAccessReviewModel = useAccessReviewForModel as jest.Mock;

/** Sets access review results: first call = NudgeConfig, second call = Component. */
const setAccessReview = (nudgeConfig: boolean, component: boolean) => {
  mockUseAccessReviewModel
    .mockReturnValueOnce([nudgeConfig])
    .mockReturnValueOnce([component]);
};

describe('useComponentRelationAction', () => {
  beforeEach(() => {
    mockUseComponents.mockReturnValue([[{}, {}], true, undefined]);
    mockUseAllComponents.mockReturnValue([[{}, {}], true, undefined]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should not disable action when both access reviews pass', () => {
    setAccessReview(true, true);
    const { result } = renderHook(() => useComponentRelationAction('application'));
    expect(result.current().isDisabled).toEqual(false);
    expect(result.current().disabledTooltip).toEqual(null);
  });

  it('enables action when only NudgeConfig patch is allowed (new model cluster)', () => {
    setAccessReview(true, false);
    const { result } = renderHook(() => useComponentRelationAction('application'));
    expect(result.current().isDisabled).toEqual(false);
    expect(result.current().disabledTooltip).toEqual(null);
  });

  it('enables action when only Component patch is allowed (legacy cluster)', () => {
    setAccessReview(false, true);
    const { result } = renderHook(() => useComponentRelationAction('application'));
    expect(result.current().isDisabled).toEqual(false);
    expect(result.current().disabledTooltip).toEqual(null);
  });

  it('disables action when both access reviews return false', () => {
    setAccessReview(false, false);
    const { result } = renderHook(() => useComponentRelationAction('application'));
    expect(result.current().isDisabled).toEqual(true);
    expect(result.current().disabledTooltip).toEqual(
      `You don't have access to define component relationships`,
    );
  });

  it('checks NudgeConfigModel and ComponentModel with patch verb', () => {
    setAccessReview(true, true);
    renderHook(() => useComponentRelationAction('application'));
    expect(mockUseAccessReviewModel).toHaveBeenCalledWith(NudgeConfigModel, 'patch');
    expect(mockUseAccessReviewModel).toHaveBeenCalledWith(ComponentModel, 'patch');
  });

  it('should disable action when there is one component in the app and namespace', () => {
    mockUseComponents.mockReturnValue([[{}], true, undefined]);
    mockUseAllComponents.mockReturnValue([[{}], true, undefined]);
    setAccessReview(true, true);
    const { result } = renderHook(() => useComponentRelationAction('application'));
    expect(result.current().isDisabled).toEqual(true);
  });

  it('should not disable action when there is one component in the app but more in namespace', () => {
    mockUseComponents.mockReturnValue([[{}], true, undefined]);
    mockUseAllComponents.mockReturnValue([[{}, {}], true, undefined]);
    setAccessReview(true, true);
    const { result } = renderHook(() => useComponentRelationAction('application'));
    expect(result.current().isDisabled).toEqual(false);
  });

  it('should disable action when there is no component in the app', () => {
    mockUseComponents.mockReturnValue([[], true, undefined]);
    mockUseAllComponents.mockReturnValue([[{}, {}], true, undefined]);
    setAccessReview(true, true);
    const { result } = renderHook(() => useComponentRelationAction('application'));
    expect(result.current().isDisabled).toEqual(true);
  });
});
