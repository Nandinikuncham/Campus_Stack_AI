-- CampusStackAI — Seed Data Migration
-- Migration: 003_seed_data.sql

-- 1. INSERT INITIAL TAGS (Safe to run without auth users)
INSERT INTO public.tags (id, name, description, color, question_count)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Python', 'General-purpose programming language widely used in AI, scripting, and backend dev.', '#3776ab', 12),
  ('a1000000-0000-0000-0000-000000000002', 'C++', 'High-performance systems programming language and Competitive Programming standard.', '#00599c', 24),
  ('a1000000-0000-0000-0000-000000000003', 'DSA', 'Data Structures and Algorithms core coursework concepts.', '#e11d48', 35),
  ('a1000000-0000-0000-0000-000000000004', 'React', 'Declarative, component-based frontend JavaScript library.', '#61dafb', 18),
  ('a1000000-0000-0000-0000-000000000005', 'Operating Systems', 'Kernel design, process scheduling, synchronization, and memory management.', '#8b5cf6', 15),
  ('a1000000-0000-0000-0000-000000000006', 'DBMS', 'Relational databases, SQL indexing, ACID transactions, and normalization.', '#059669', 14),
  ('a1000000-0000-0000-0000-000000000007', 'Computer Networks', 'OSI model, TCP/IP handshake, socket programming, and routing protocols.', '#0284c7', 10),
  ('a1000000-0000-0000-0000-000000000008', 'Placements', 'Technical interviews, coding round patterns, system design, and resume tips.', '#d97706', 28)
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. INSERT INITIAL BADGES
INSERT INTO public.badges (id, name, description, icon, tier)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'First Spark', 'Asked your first question on CampusStackAI', 'Sparkles', 'bronze'),
  ('b1000000-0000-0000-0000-000000000002', 'Helpful Peer', 'Provided your first verified and accepted answer', 'CheckCircle', 'bronze'),
  ('b1000000-0000-0000-0000-000000000003', 'Scholar', 'Earned 100+ reputation points through helpful contributions', 'Award', 'silver'),
  ('b1000000-0000-0000-0000-000000000004', 'Campus Legend', 'Earned 500+ reputation points and accepted across 10 colleges', 'Trophy', 'gold'),
  ('b1000000-0000-0000-0000-000000000005', 'Algorithm Master', 'Answered 10+ algorithms questions with positive community votes', 'Brain', 'silver')
ON CONFLICT (name) DO NOTHING;

-- =========================================================================
-- NOTE FOR DEVELOPERS:
-- The sample profile & question data below references placeholder UUIDs.
-- If you are testing in Supabase, first create users in the Supabase Auth
-- dashboard (or via /signup), then assign their UUIDs to sample questions.
-- =========================================================================

/*
-- UNCOMMENT TO SEED DUMMY PROFILES AND QUESTIONS FOR LOCAL TEST USERS:

INSERT INTO public.profiles (id, username, full_name, college, department, graduation_year, skills, reputation, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'rohit_cs', 'Rohit Sharma', 'IIT Bombay', 'Computer Science', 2026, ARRAY['C++', 'DSA', 'Operating Systems'], 145, 'student'),
  ('00000000-0000-0000-0000-000000000002', 'ananya_dev', 'Ananya Verma', 'BITS Pilani', 'Information Technology', 2025, ARRAY['React', 'TypeScript', 'Node.js'], 230, 'student'),
  ('00000000-0000-0000-0000-000000000003', 'prof_arun', 'Dr. Arun Kumar', 'IIT Delhi', 'Computer Science', 2010, ARRAY['Algorithms', 'System Design'], 520, 'faculty')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.questions (id, title, body, author_id, status, view_count, vote_count, answer_count)
VALUES
  (
    'c1000000-0000-0000-0000-000000000001',
    'Why does my recursive Dijkstra implementation enter infinite loops with negative edge weights?',
    'I am trying to run Dijkstra on a directed graph in C++. For positive edge graphs it finishes with optimal paths, but when I introduce negative cycles or negative edges it keeps looping or yields suboptimal distances. Is Dijkstra mathematically flawed for negative weights?',
    '00000000-0000-0000-0000-000000000001',
    'open',
    184,
    14,
    2
  ),
  (
    'c1000000-0000-0000-0000-000000000002',
    'Difference between optimistic locking vs pessimistic locking in distributed DBMS',
    'We are designing a student course registration portal that experiences high contention during the first 5 minutes of enrollment. Should we utilize row-level pessimistic locks (SELECT FOR UPDATE) or version-based optimistic locking to prevent double bookings?',
    '00000000-0000-0000-0000-000000000002',
    'open',
    92,
    8,
    1
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_tags (question_id, tag_id)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002'),
  ('c1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('c1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000006')
ON CONFLICT DO NOTHING;
*/
