-- CampusStackAI — Row Level Security (RLS) Policies
-- Migration: 002_rls_policies.sql

-- Helper Function: Get current authenticated user role
CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 1. Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reputation_events ENABLE ROW LEVEL SECURITY;

-- 2. PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 3. TAGS POLICIES
CREATE POLICY "Tags are viewable by everyone"
  ON public.tags FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tags"
  ON public.tags FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins and moderators can update tags"
  ON public.tags FOR UPDATE
  USING (public.get_auth_user_role() IN ('admin', 'moderator'));

-- 4. QUESTIONS POLICIES
CREATE POLICY "Active questions are viewable by everyone"
  ON public.questions FOR SELECT
  USING (status != 'deleted' OR author_id = auth.uid() OR public.get_auth_user_role() IN ('admin', 'moderator'));

CREATE POLICY "Authenticated users can post questions"
  ON public.questions FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or moderators can update questions"
  ON public.questions FOR UPDATE
  USING (auth.uid() = author_id OR public.get_auth_user_role() IN ('admin', 'moderator'));

CREATE POLICY "Authors or moderators can delete questions"
  ON public.questions FOR DELETE
  USING (auth.uid() = author_id OR public.get_auth_user_role() IN ('admin', 'moderator'));

-- 5. QUESTION_TAGS POLICIES
CREATE POLICY "Question tags are viewable by everyone"
  ON public.question_tags FOR SELECT
  USING (true);

CREATE POLICY "Question authors can link tags"
  ON public.question_tags FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.questions
      WHERE id = question_id AND author_id = auth.uid()
    )
  );

-- 6. ANSWERS POLICIES
CREATE POLICY "Answers are viewable by everyone"
  ON public.answers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post answers"
  ON public.answers FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or moderators can update answers"
  ON public.answers FOR UPDATE
  USING (auth.uid() = author_id OR public.get_auth_user_role() IN ('admin', 'moderator'));

CREATE POLICY "Authors or moderators can delete answers"
  ON public.answers FOR DELETE
  USING (auth.uid() = author_id OR public.get_auth_user_role() IN ('admin', 'moderator'));

-- 7. COMMENTS POLICIES
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can post comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors or moderators can delete comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = author_id OR public.get_auth_user_role() IN ('admin', 'moderator'));

-- 8. VOTES POLICIES
CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT
  USING (true);

CREATE POLICY "Users can manage their own votes"
  ON public.votes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 9. BOOKMARKS POLICIES
CREATE POLICY "Users can manage their own bookmarks"
  ON public.bookmarks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 10. NOTIFICATIONS POLICIES
CREATE POLICY "Users can view and manage their own notifications"
  ON public.notifications FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 11. BADGES POLICIES
CREATE POLICY "Badges are viewable by everyone"
  ON public.badges FOR SELECT
  USING (true);

CREATE POLICY "User badges are viewable by everyone"
  ON public.user_badges FOR SELECT
  USING (true);

-- 12. REPORTS POLICIES
CREATE POLICY "Authenticated users can submit reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

CREATE POLICY "Only staff can view reports"
  ON public.reports FOR SELECT
  USING (public.get_auth_user_role() IN ('admin', 'moderator'));

CREATE POLICY "Only staff can update reports"
  ON public.reports FOR UPDATE
  USING (public.get_auth_user_role() IN ('admin', 'moderator'));

-- 13. AI USAGE LOGS POLICIES
CREATE POLICY "Users can view their own AI usage"
  ON public.ai_usage_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AI usage"
  ON public.ai_usage_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 14. REPUTATION EVENTS POLICIES
CREATE POLICY "Reputation events are viewable by everyone"
  ON public.reputation_events FOR SELECT
  USING (true);
