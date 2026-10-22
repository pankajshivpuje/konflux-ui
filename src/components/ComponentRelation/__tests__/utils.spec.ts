import { ComponentRelationNudgeType } from '../type';
import {
  componentRelationValidationSchema,
  computeNudgeDataChanges,
  toCustomBoolean,
  toNudgeConfigNudges,
  transformNudgeData,
} from '../utils';

const imm = 'immediate' as const;
const val = 'validated' as const;

describe('computeNudgeDataChanges', () => {
  it('should compute data changes', () => {
    expect(
      computeNudgeDataChanges(
        [{ source: 'a', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b', 'c'], mode: imm }],
        [],
      ),
    ).toEqual([{ source: 'a', nudgeType: ComponentRelationNudgeType.NUDGES, target: [], mode: imm }]);
    expect(
      computeNudgeDataChanges(
        [],
        [{ source: 'a', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b', 'c'], mode: imm }],
      ),
    ).toEqual([{ source: 'a', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b', 'c'], mode: imm }]);
    expect(
      computeNudgeDataChanges(
        [
          { source: 'a', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b'], mode: imm },
          { source: 'b', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['c'], mode: imm },
          { source: 'c', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['d'], mode: imm },
        ],
        [{ source: 'b', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['c'], mode: imm }],
      ),
    ).toEqual([
      { source: 'b', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['c'], mode: imm },
      { source: 'a', nudgeType: ComponentRelationNudgeType.NUDGES, target: [], mode: imm },
      { source: 'c', nudgeType: ComponentRelationNudgeType.NUDGES, target: [], mode: imm },
    ]);
  });
});

describe('transformNudgeData', () => {
  it('should transform data', () => {
    expect(
      transformNudgeData([
        { source: 'abcd', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b', 'c'], mode: imm },
      ]),
    ).toEqual({ abcd: ['b', 'c'] });
    expect(
      transformNudgeData([
        { source: 'abcd', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b', 'c'], mode: imm },
        { source: 'abcd', nudgeType: ComponentRelationNudgeType.NUDGED_BY, target: ['b', 'c'], mode: imm },
      ]),
    ).toEqual({ abcd: ['b', 'c'], b: ['abcd'], c: ['abcd'] });
    expect(
      transformNudgeData([
        { source: 'abcd', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b', 'c'], mode: imm },
        { source: 'abcd', nudgeType: ComponentRelationNudgeType.NUDGED_BY, target: ['b', 'c'], mode: imm },
        { source: 'b', nudgeType: ComponentRelationNudgeType.NUDGED_BY, target: ['abcd', 'c'], mode: imm },
      ]),
    ).toEqual({ abcd: ['b', 'c'], b: ['abcd'], c: ['abcd', 'b'] });
    expect(
      transformNudgeData([
        { source: 'abcd', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['b', 'c'], mode: imm },
        { source: 'abcd', nudgeType: ComponentRelationNudgeType.NUDGED_BY, target: ['b', 'c'], mode: imm },
        { source: 'b', nudgeType: ComponentRelationNudgeType.NUDGED_BY, target: ['abcd', 'c'], mode: imm },
        { source: 'c', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['abcd', 'b'], mode: imm },
      ]),
    ).toEqual({ abcd: ['b', 'c'], b: ['abcd'], c: ['abcd', 'b'] });
  });
});

describe('toNudgeConfigNudges', () => {
  it('converts NUDGES relations to from/to pairs', () => {
    const result = toNudgeConfigNudges([
      { source: 'comp-a', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['comp-b', 'comp-c'], mode: imm },
    ]);
    expect(result).toEqual([
      { from: 'comp-a', to: 'comp-b', mode: 'immediate' },
      { from: 'comp-a', to: 'comp-c', mode: 'immediate' },
    ]);
  });

  it('converts NUDGED_BY relations to from/to pairs (inverted)', () => {
    const result = toNudgeConfigNudges([
      { source: 'comp-b', nudgeType: ComponentRelationNudgeType.NUDGED_BY, target: ['comp-a'], mode: imm },
    ]);
    expect(result).toEqual([{ from: 'comp-a', to: 'comp-b', mode: 'immediate' }]);
  });

  it('includes gatingGroup for validated mode', () => {
    const result = toNudgeConfigNudges([
      {
        source: 'comp-a',
        nudgeType: ComponentRelationNudgeType.NUDGES,
        target: ['comp-b'],
        mode: val,
        gatingGroup: 'my-group',
      },
    ]);
    expect(result).toEqual([{ from: 'comp-a', to: 'comp-b', mode: 'validated', gatingGroup: 'my-group' }]);
  });

  it('omits gatingGroup for immediate mode', () => {
    const result = toNudgeConfigNudges([
      {
        source: 'comp-a',
        nudgeType: ComponentRelationNudgeType.NUDGES,
        target: ['comp-b'],
        mode: imm,
        gatingGroup: 'ignored-group',
      },
    ]);
    expect(result).toEqual([{ from: 'comp-a', to: 'comp-b', mode: 'immediate' }]);
  });

  it('skips relations with empty source or target', () => {
    const result = toNudgeConfigNudges([
      { source: '', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['comp-b'], mode: imm },
      { source: 'comp-a', nudgeType: ComponentRelationNudgeType.NUDGES, target: [], mode: imm },
    ]);
    expect(result).toEqual([]);
  });
});

describe('componentRelationValidationSchema', () => {
  it('should validate yup schema', async () => {
    const values = {
      relations: [
        { source: 'adf', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['a'], mode: imm },
        { source: 'adf', nudgeType: ComponentRelationNudgeType.NUDGED_BY, target: ['b', 'c'], mode: imm },
      ],
    };
    await expect(componentRelationValidationSchema.validate(values)).resolves.toBe(values);
    await expect(
      componentRelationValidationSchema.validate({
        relations: [
          { source: 'adf', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['a'], mode: imm },
          { source: 'adf', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['f'], mode: imm },
        ],
      }),
    ).rejects.toThrow('2 errors occurred');
    await expect(
      componentRelationValidationSchema.validate({
        relations: [],
      }),
    ).rejects.toThrowError();
    await expect(
      componentRelationValidationSchema.validate({
        relations: [{ source: 'adf', target: ['a'] }],
      }),
    ).rejects.toThrowError();
  });

  it('rejects validated mode without a gatingGroup', async () => {
    await expect(
      componentRelationValidationSchema.validate({
        relations: [
          { source: 'adf', nudgeType: ComponentRelationNudgeType.NUDGES, target: ['a'], mode: val },
        ],
      }),
    ).rejects.toThrowError();
  });

  it('accepts validated mode with a gatingGroup', async () => {
    const values = {
      relations: [
        {
          source: 'adf',
          nudgeType: ComponentRelationNudgeType.NUDGES,
          target: ['a'],
          mode: val,
          gatingGroup: 'my-group',
        },
      ],
    };
    await expect(componentRelationValidationSchema.validate(values)).resolves.toBe(values);
  });
});

describe('toCustomBoolean', () => {
  it('should use custom logic to convert value to boolean', () => {
    expect(toCustomBoolean([])).toBe(false);
    expect(toCustomBoolean(['a'])).toBe(true);
    expect(toCustomBoolean('a')).toBe(true);
    expect(toCustomBoolean(null)).toBe(false);
    expect(toCustomBoolean(undefined)).toBe(false);
  });
});
