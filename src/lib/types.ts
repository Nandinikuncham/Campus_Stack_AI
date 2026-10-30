export type UserRole = 'student' | 'faculty' | 'moderator' | 'admin'
export type QuestionStatus = 'open' | 'closed' | 'duplicate' | 'deleted'
export type NotificationType = 'new_answer' | 'comment_reply' | 'answer_accepted' | 'mention' | 'badge_awarded' | 'announcement'
export type BadgeTier = 'bronze' | 'silver' | 'gold'
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

export interface Profile {
  id: string
  username: string
  full_name: string | null
  email: string | null
  avatar_url: string | null
  bio: string | null
  college: string | null
  department: string | null
  graduation_year: number | null
  skills: string[] | null
  role: UserRole
  reputation: number
  is_email_verified: boolean
  is_banned: boolean
  profile_public: boolean
  created_at: string
  updated_at: string
}

export interface Tag {
  id: string
  name: string
  description: string | null
  color: string
  question_count: number
  created_by: string | null
  created_at: string
}

export interface Question {
  id: string
  title: string
  body: string
  author_id: string
  status: QuestionStatus
  accepted_answer_id: string | null
  view_count: number
  vote_count: number
  answer_count: number
  is_ai_improved: boolean
  created_at: string
  updated_at: string
  author?: Profile
  tags?: Tag[]
  user_vote?: number | null
  is_bookmarked?: boolean
}

export interface Answer {
  id: string
  question_id: string
  author_id: string
  body: string
  vote_count: number
  is_accepted: boolean
  is_ai_generated: boolean
  created_at: string
  updated_at: string
  author?: Profile
  user_vote?: number | null
  comments?: Comment[]
}

export interface Comment {
  id: string
  author_id: string
  body: string
  question_id: string | null
  answer_id: string | null
  created_at: string
  updated_at: string
  author?: Profile
}

export interface Bookmark {
  id: string
  user_id: string
  question_id: string
  created_at: string
  question?: Question
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  title: string
  body: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string | null
  icon: string | null
  tier: BadgeTier | null
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: string
  awarded_at: string
  badge?: Badge
}

export interface Report {
  id: string
  reporter_id: string
  reason: string
  details: string | null
  status: ReportStatus
  question_id: string | null
  answer_id: string | null
  comment_id: string | null
  created_at: string
  reporter?: Profile
}

export interface ReputationEvent {
  id: string
  user_id: string
  delta: number
  reason: string
  question_id: string | null
  answer_id: string | null
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
