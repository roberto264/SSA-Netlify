#!/usr/bin/env node

/**
 * Seed Test Users
 * Erstellt Testbenutzer mit Lernfortschritt, Quiz-Ergebnissen und Rollenspiel-Sessions.
 *
 * Nutzung:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-testusers.js
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY müssen gesetzt sein.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const PASSWORD = 'Test1234!';

// ─── User Definitions ──────────────────────────────────────
const users = [
  { email: 'admin@ssa-test.ch', name: 'Admin User', role: 'betreiber', firma: null },
  { email: 'privat@ssa-test.ch', name: 'Lisa Privat', role: 'privat', firma: null },
  { email: 'chef@ssa-test.ch', name: 'Marco Chef', role: 'arbeitgeber', firma: 'Solar Plus GmbH' },
  { email: 'anna@ssa-test.ch', name: 'Anna Lernend', role: 'lernender', firma: 'Solar Plus GmbH' },
  { email: 'ben@ssa-test.ch', name: 'Ben Fleissig', role: 'lernender', firma: 'Solar Plus GmbH' },
  { email: 'clara@ssa-test.ch', name: 'Clara Neu', role: 'lernender', firma: 'Solar Plus GmbH' },
];

async function createUser(userData) {
  // Create auth user
  const { data: authData, error: authErr } = await supabase.auth.admin.createUser({
    email: userData.email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { name: userData.name },
  });

  if (authErr) {
    if (authErr.message?.includes('already been registered')) {
      // User exists — get existing
      const { data: { users: existing } } = await supabase.auth.admin.listUsers();
      const found = existing.find(u => u.email === userData.email);
      if (found) {
        console.log(`  ↳ ${userData.email} existiert bereits (${found.id})`);
        return found.id;
      }
    }
    console.error(`  Fehler bei ${userData.email}:`, authErr.message);
    return null;
  }

  const userId = authData.user.id;
  console.log(`  ✓ ${userData.email} erstellt (${userId})`);
  return userId;
}

async function setupProfiles(userIds) {
  // Get or create firma
  let firmaId = null;
  const firmaName = 'Solar Plus GmbH';

  const { data: existingFirma } = await supabase
    .from('firmen')
    .select('id')
    .eq('name', firmaName)
    .single();

  if (existingFirma) {
    firmaId = existingFirma.id;
  } else {
    const { data: newFirma } = await supabase
      .from('firmen')
      .insert({
        name: firmaName,
        subscription_status: 'active',
        seat_limit: 5,
        trial_ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select()
      .single();
    firmaId = newFirma?.id;
  }

  console.log(`\n✓ Firma "${firmaName}" (${firmaId})`);

  // Upsert profiles
  for (let i = 0; i < users.length; i++) {
    const u = users[i];
    const id = userIds[i];
    if (!id) continue;

    await supabase.from('profiles').upsert({
      id,
      email: u.email,
      name: u.name,
      role: u.role,
      firma: u.firma,
      firma_id: u.firma ? firmaId : null,
      subscription_status: u.role === 'privat' ? 'trialing' : null,
      trial_ends_at: u.role === 'privat' ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : null,
    }, { onConflict: 'id' });
  }
  console.log('✓ Profile angelegt');
  return firmaId;
}

async function getQuizTopics() {
  const { data } = await supabase
    .from('quiz_topics')
    .select('id, module_id')
    .order('module_id')
    .order('sort_order');
  return data || [];
}

async function seedProgress(userId, name, completionRate) {
  const topics = await getQuizTopics();

  // Module progress
  const topicsToComplete = Math.floor(topics.length * completionRate);
  const selectedTopics = topics.slice(0, topicsToComplete);

  for (const topic of selectedTopics) {
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    await supabase.from('modul_fortschritt').upsert({
      user_id: userId,
      modul_id: topic.module_id,
      topic_id: topic.id,
      completed: true,
      score,
      completed_at: randomDate(30),
    }, { onConflict: 'user_id,modul_id,topic_id' });
  }

  // Quiz results
  for (const topic of selectedTopics) {
    const maxScore = Math.floor(Math.random() * 3) + 4; // 4-6 questions
    const score = Math.floor(maxScore * (0.6 + Math.random() * 0.4)); // 60-100%
    const passed = score / maxScore >= 0.7;

    await supabase.from('quiz_ergebnisse').insert({
      user_id: userId,
      modul_id: topic.module_id,
      topic_id: topic.id,
      score,
      max_score: maxScore,
      passed,
      answers: [],
      created_at: randomDate(30),
    });
  }

  // Rollenspiel sessions
  const personaIds = ['mueller', 'gruenfeld', 'baumann', 'techag'];
  const sessionCount = Math.floor(completionRate * 6) + 1;

  for (let i = 0; i < sessionCount; i++) {
    const personaId = personaIds[i % personaIds.length];
    const rating = ['schwach', 'mittel', 'gut'][Math.floor(Math.random() * 3)];

    await supabase.from('rollenspiel_sessions').insert({
      user_id: userId,
      persona_id: personaId,
      messages: [
        { role: 'assistant', content: 'Grüezi, ich bin Thomas Müller. Was können Sie mir anbieten?' },
        { role: 'user', content: 'Guten Tag Herr Müller! Ich freue mich, dass Sie sich für Solarenergie interessieren.' },
        { role: 'assistant', content: 'Ja, unsere Nachbarn haben eine Anlage. Was würde das bei uns kosten?' },
        { role: 'user', content: 'Das hängt von Ihrer Dachfläche ab. Mit 80m² Südausrichtung wäre eine 10 kWp Anlage ideal.' },
      ],
      rating,
      ai_feedback: `${name} hat ${rating === 'gut' ? 'ausgezeichnet' : rating === 'mittel' ? 'solide' : 'mit Verbesserungspotenzial'} abgeschnitten. Die Gesprächsführung war ${rating === 'gut' ? 'sehr professionell' : 'ausbaufähig'}.`,
      gesprachsfuhrung: randomSkill(rating),
      aktives_zuhoren: randomSkill(rating),
      klarheit: randomSkill(rating),
      einwand_behandlung: randomSkill(rating),
      empathie: randomSkill(rating),
      uberzeugungskraft: randomSkill(rating),
      session_type: i % 3 === 0 ? 'zen' : 'standard',
      created_at: randomDate(30),
    });
  }

  console.log(`  ✓ ${name}: ${topicsToComplete}/${topics.length} Topics, ${sessionCount} Rollenspiele`);
}

function randomDate(daysBack) {
  const d = new Date();
  d.setDate(d.getDate() - Math.floor(Math.random() * daysBack));
  d.setHours(Math.floor(Math.random() * 12) + 8);
  return d.toISOString();
}

function randomSkill(rating) {
  const base = rating === 'gut' ? 4 : rating === 'mittel' ? 3 : 2;
  return Math.min(5, Math.max(1, base + Math.floor(Math.random() * 2)));
}

// ─── MAIN ──────────────────────────────────────────────────
async function main() {
  console.log('=== Test User Seed Start ===\n');
  console.log(`Passwort für alle: ${PASSWORD}\n`);

  // 1. Create auth users
  console.log('1. Auth Users erstellen...');
  const userIds = [];
  for (const u of users) {
    const id = await createUser(u);
    userIds.push(id);
  }

  // 2. Setup profiles + firma
  console.log('\n2. Profile + Firma...');
  await setupProfiles(userIds);

  // 3. Seed progress data
  console.log('\n3. Lernfortschritt + Auswertungen...');

  // Admin: 100% (sieht alles)
  if (userIds[0]) await seedProgress(userIds[0], 'Admin', 1.0);

  // Privat: 60%
  if (userIds[1]) await seedProgress(userIds[1], 'Lisa Privat', 0.6);

  // Chef (Arbeitgeber): 30%
  if (userIds[2]) await seedProgress(userIds[2], 'Marco Chef', 0.3);

  // Anna: 80% (fleissig)
  if (userIds[3]) await seedProgress(userIds[3], 'Anna Lernend', 0.8);

  // Ben: 50% (mittel)
  if (userIds[4]) await seedProgress(userIds[4], 'Ben Fleissig', 0.5);

  // Clara: 15% (gerade angefangen)
  if (userIds[5]) await seedProgress(userIds[5], 'Clara Neu', 0.15);

  console.log('\n=== Seed abgeschlossen ===');
  console.log('\nLogins:');
  console.log('─────────────────────────────────────────');
  users.forEach(u => {
    console.log(`  ${u.role.padEnd(12)} │ ${u.email.padEnd(22)} │ ${PASSWORD}`);
  });
  console.log('─────────────────────────────────────────');
}

main();
