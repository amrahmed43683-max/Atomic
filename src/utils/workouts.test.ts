import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_WORKOUT_DAYS,
  getWorkoutForDay,
  recommendWorkoutTier,
  resolveEffectiveWeightKg,
} from './workouts';

test('weekly split covers distinct balanced muscle groups with dumbbells', () => {
  const sunday = getWorkoutForDay({
    dayIndex: 0,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    tier: 2,
    hasDumbbells: true,
  });
  const monday = getWorkoutForDay({
    dayIndex: 1,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    tier: 2,
    hasDumbbells: true,
  });
  const wednesday = getWorkoutForDay({
    dayIndex: 3,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    tier: 2,
    hasDumbbells: true,
  });
  const friday = getWorkoutForDay({
    dayIndex: 5,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    tier: 2,
    hasDumbbells: true,
  });

  assert.equal(sunday.isRestOrRecovery, false);
  assert.equal(monday.isRestOrRecovery, false);
  assert.equal(wednesday.isRestOrRecovery, false);
  assert.equal(friday.isRestOrRecovery, true);

  assert.notEqual(sunday.splitTitle, monday.splitTitle);
  assert.notEqual(monday.splitTitle, wednesday.splitTitle);

  assert.ok(sunday.exercises.some((e) => e.usesDumbbells));
  assert.ok(monday.exercises.some((e) => e.usesDumbbells));
  assert.ok(wednesday.exercises.some((e) => e.usesDumbbells));
});

test('progressive tiers increase sets and exercise difficulty from Tier 1 to Tier 5', () => {
  const tier1 = getWorkoutForDay({
    dayIndex: 0,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    tier: 1,
    hasDumbbells: true,
  });
  const tier5 = getWorkoutForDay({
    dayIndex: 0,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    tier: 5,
    hasDumbbells: true,
  });

  const setsT1 = tier1.exercises.reduce((acc, e) => acc + e.sets, 0);
  const setsT5 = tier5.exercises.reduce((acc, e) => acc + e.sets, 0);
  assert.ok(setsT5 > setsT1);
  assert.notEqual(tier1.exercises[0].name, tier5.exercises[0].name);
  assert.ok(tier5.exercises[0].restSeconds < tier1.exercises[0].restSeconds);
});

test('bodyweight fallback works cleanly when hasDumbbells is false', () => {
  const bwPlan = getWorkoutForDay({
    dayIndex: 3,
    workoutDays: DEFAULT_WORKOUT_DAYS,
    tier: 3,
    hasDumbbells: false,
  });
  assert.ok(bwPlan.exercises.every((e) => !e.usesDumbbells));
  assert.ok(bwPlan.exercises.every((e) => e.equipmentLabel === 'وزن الجسم'));
});

test('recommendWorkoutTier and resolveEffectiveWeightKg scale properly', () => {
  assert.equal(recommendWorkoutTier('beginner', 0, 1), 1);
  assert.equal(recommendWorkoutTier('beginner', 16, 10), 2);
  assert.equal(recommendWorkoutTier('intermediate', 40, 25), 4);
  assert.equal(recommendWorkoutTier('advanced', 40, 30), 5);

  const w1 = resolveEffectiveWeightKg(10, 0.75, 1);
  const w5 = resolveEffectiveWeightKg(10, 0.75, 5);
  assert.ok(w5 > w1);
});
