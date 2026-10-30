export const POPULAR_TAGS = [
  'Python', 'JavaScript', 'TypeScript', 'React', 'Node.js',
  'Java', 'C++', 'C', 'DSA', 'Algorithms', 'Data Structures',
  'DBMS', 'SQL', 'MongoDB', 'Operating Systems', 'Computer Networks',
  'Web Development', 'Cloud Computing', 'Machine Learning', 'AI',
  'Placements', 'Competitive Programming', 'System Design', 'Git', 'Linux',
]

export const ALLOWED_EMAIL_DOMAIN = '@gvpcew.ac.in'

export function isAllowedCollegeEmail(email: string): boolean {
  if (!email) return false
  return email.trim().toLowerCase().endsWith(ALLOWED_EMAIL_DOMAIN)
}

export const DEFAULT_COLLEGE = 'Gayatri Vidya Parishad College of Engineering for Women(A)'

export const COLLEGES = [
  'Gayatri Vidya Parishad College of Engineering for Women(A)',
]

export const DEPARTMENTS = [
  'Computer Science', 'Information Technology', 'Electronics',
  'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering',
  'Mathematics', 'Physics', 'MBA', 'Other',
]

export const REPUTATION_VALUES = {
  QUESTION_UPVOTED: 5,
  QUESTION_DOWNVOTED: -2,
  ANSWER_UPVOTED: 10,
  ANSWER_DOWNVOTED: -2,
  ANSWER_ACCEPTED: 15,
  ACCEPT_ANSWER: 2,
}

export const PAGE_SIZE = 10
export const AI_RATE_LIMIT_PER_HOUR = 20
