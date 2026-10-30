import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { REPUTATION_VALUES } from '@/lib/constants'
import { z } from 'zod'

const voteSchema = z.object({
  targetId: z.string().uuid(),
  targetType: z.enum(['question', 'answer']),
  value: z.union([z.literal(1), z.literal(-1)]),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const json = await request.json()
    const parsed = voteSchema.safeParse(json)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid vote parameters' }, { status: 400 })

    const { targetId, targetType, value } = parsed.data
    const admin = await createAdminClient()

    // 1. Fetch content author to prevent self-voting
    let authorId = ''
    if (targetType === 'question') {
      const { data: q } = await admin.from('questions').select('author_id').eq('id', targetId).single()
      if (!q) return NextResponse.json({ error: 'Question not found' }, { status: 404 })
      authorId = q.author_id
    } else {
      const { data: a } = await admin.from('answers').select('author_id').eq('id', targetId).single()
      if (!a) return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
      authorId = a.author_id
    }

    if (authorId === user.id) {
      return NextResponse.json({ error: 'You cannot vote on your own content' }, { status: 400 })
    }

    // 2. Check for existing vote
    let voteQuery = admin
      .from('votes')
      .select('*')
      .eq('user_id', user.id)

    if (targetType === 'question') {
      voteQuery = voteQuery.eq('question_id', targetId)
    } else {
      voteQuery = voteQuery.eq('answer_id', targetId)
    }

    const { data: existingVote } = await voteQuery.single()

    let newVoteValue: number | null = null
    let repDelta = 0

    const upvoteRep = targetType === 'question' ? REPUTATION_VALUES.QUESTION_UPVOTED : REPUTATION_VALUES.ANSWER_UPVOTED
    const downvoteRep = targetType === 'question' ? REPUTATION_VALUES.QUESTION_DOWNVOTED : REPUTATION_VALUES.ANSWER_DOWNVOTED

    if (existingVote) {
      if (existingVote.value === value) {
        // Toggle OFF: Delete vote
        await admin.from('votes').delete().eq('id', existingVote.id)
        newVoteValue = null
        repDelta = value === 1 ? -upvoteRep : -downvoteRep
      } else {
        // Reverse vote (-1 to 1 or 1 to -1)
        await admin.from('votes').update({ value }).eq('id', existingVote.id)
        newVoteValue = value
        repDelta = value === 1 ? (upvoteRep - downvoteRep) : (downvoteRep - upvoteRep)
      }
    } else {
      // New vote
      await admin.from('votes').insert({
        user_id: user.id,
        question_id: targetType === 'question' ? targetId : null,
        answer_id: targetType === 'answer' ? targetId : null,
        value,
      })
      newVoteValue = value
      repDelta = value === 1 ? upvoteRep : downvoteRep
    }

    // 3. Update target vote count on question/answer
    const targetTable = targetType === 'question' ? 'questions' : 'answers'
    const { data: allVotes } = await admin
      .from('votes')
      .select('value')
      .eq(targetType === 'question' ? 'question_id' : 'answer_id', targetId)

    const totalVotes = (allVotes || []).reduce((acc: number, v: any) => acc + (v.value || 0), 0)
    await admin.from(targetTable).update({ vote_count: totalVotes }).eq('id', targetId)

    // 4. Update author reputation
    if (repDelta !== 0 && authorId) {
      const { data: targetProfile } = await admin.from('profiles').select('reputation').eq('id', authorId).single()
      if (targetProfile) {
        const nextRep = Math.max(0, targetProfile.reputation + repDelta)
        await admin.from('profiles').update({ reputation: nextRep }).eq('id', authorId)
      }
    }

    return NextResponse.json({
      success: true,
      userVote: newVoteValue,
      voteCount: totalVotes,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Error processing vote' }, { status: 500 })
  }
}
