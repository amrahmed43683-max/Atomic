import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addXpToProfile,
  computeStreak,
  createProfileState,
  deductXpFromProfile,
  localDateStr,
  rankForLevel,
  togglePrayerInProfile,
  toggleWorkoutCompletion,
  xpForLevel,
} from './leveling';

test('createProfileState creates custom profile without hardcoded AMR', () => {
  const profile = createProfileState({
    name: 'كريم',
    fitnessLevel: 'intermediate',
    hasDumbbells: true,
    dumbbellWeightKg: 10,
  });

  assert.equal(profile.player.name, 'كريم');
  assert.equal(profile.player.fitnessLevel, 'intermediate');
  assert.equal(profile.player.hasDumbbells, true);
  assert.equal(profile.player.dumbbellWeightKg, 10);
  assert.equal(profile.player.level, 1);
  assert.ok(profile.today.mainQuests.length >= 4);
});

test('addXpToProfile and deductXpFromProfile level up and undo cleanly', () => {
  let profile = createProfileState({ name: 'سارة' });
  const level1Need = xpForLevel(1);
  assert.equal(level1Need, 100);

  const up = addXpToProfile(profile, 130, 'strength');
  profile = up.profile;
  assert.equal(up.leveledUpTo, 2);
  assert.equal(profile.player.level, 2);
  assert.equal(profile.player.xp, 30);
  assert.equal(profile.player.totalXp, 130);
  assert.ok(profile.attributes.strength > 10);

  profile = deductXpFromProfile(profile, 50, 'strength');
  assert.equal(profile.player.level, 1);
  assert.equal(profile.player.xp, 80);
  assert.equal(profile.player.totalXp, 80);
});

test('togglePrayerInProfile prevents duplicate XP and supports clean undo', () => {
  let profile = createProfileState({ name: 'يوسف' });

  const r1 = togglePrayerInProfile(profile, 'fajr', 'prayed');
  profile = r1.profile;
  assert.equal(r1.deltaXp, 10);
  assert.equal(profile.totalPrayers, 1);
  assert.equal(profile.player.totalXp, 10);

  // Switch prayed -> missed should refund XP and decrement totalPrayers
  const r2 = togglePrayerInProfile(profile, 'fajr', 'missed');
  profile = r2.profile;
  assert.equal(r2.deltaXp, -10);
  assert.equal(profile.totalPrayers, 0);
  assert.equal(profile.player.totalXp, 0);
});

test('toggleWorkoutCompletion syncs linked main quest without double XP', () => {
  let profile = createProfileState({ name: 'أحمد' });
  const res = toggleWorkoutCompletion(profile, 2);
  profile = res.profile;

  assert.equal(profile.today.workoutDone, true);
  assert.equal(profile.totalWorkouts, 1);
  assert.equal(res.deltaXp, profile.settings.xpValues.workout);
  const linked = profile.today.mainQuests.find((q) => q.linkedToWorkout);
  assert.ok(linked);
  assert.equal(linked.done, true);

  // Undo workout also unchecks linked main quest
  const undo = toggleWorkoutCompletion(profile, 2);
  profile = undo.profile;
  assert.equal(profile.today.workoutDone, false);
  assert.equal(profile.totalWorkouts, 0);
  assert.equal(profile.player.totalXp, 0);
  const linkedAfter = profile.today.mainQuests.find((q) => q.linkedToWorkout);
  assert.equal(linkedAfter?.done, false);
});

test('rankForLevel and computeStreak work accurately', () => {
  assert.equal(rankForLevel(1).name, 'E-RANK');
  assert.equal(rankForLevel(10).name, 'C-RANK');
  assert.equal(rankForLevel(50).name, 'S-RANK');

  const now = new Date(2026, 10, 16, 12, 0, 0);
  const today = localDateStr(now);
  const yesterday = localDateStr(new Date(2026, 10, 15, 12, 0, 0));

  const profile = createProfileState({ name: 'نور' });
  profile.today.date = today;
  profile.today.mainQuests[0].done = true;
  profile.today.mainQuests[1].done = true;
  profile.history[yesterday] = {
    ...profile.today,
    date: yesterday,
  };

  assert.equal(computeStreak(profile, now), 2);
});
