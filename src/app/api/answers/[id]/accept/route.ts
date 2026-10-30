import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { REPUTATION_VALUES } from '@/lib/constants'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: answerId } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Fetch answer with question
    const { data: answer, error: aError } = await supabase
      .from('answers')
      .select('*, question:questions(*)')
      .eq('id', answerId)
      .single()

    if (aError || !answer || !answer.question) {
      return NextResponse.json({ error: 'Answer not found' }, { status: 404 })
    }

    // 2. Verify current user is question author
    if (answer.question.author_id !== user.id) {
      return NextResponse.json({ error: 'Only the question author can accept answers' }, { status: 403 })
    }

    const admin = await createAdminClient()
    const isCurrentlyAccepted = answer.is_accepted

    if (isCurrentlyAccepted) {
      // Toggle OFF: unaccept answer
      await admin.from('answers').update({ is_accepted: false }).eq('id', answerId)
      await admin.from('questions').update({ accepted_answer_id: null }).eq('id', answer.question_id)

      // Deduct reputation
      try {
        await admin.rpc('increment_reputation', {
          target_user_id: answer.author_id,
          amount: -REPUTATION_VALUES.ANSWER_ACCEPTED,
        })
      } catch {
        const { data: prof } = await admin.from('profiles').select('reputation').eq('id', answer.author_id).single()
        if (prof) {
          await admin.from('profiles').update({ reputation: Math.max(0, prof.reputation - REPUTATION_VALUES.ANSWER_ACCEPTED) }).eq('id', answer.author_id)
        }
      }

      return NextResponse.json({ accepted: false })
    } else {
      // If another answer was previously accepted on this question, clear it
      if (answer.question.accepted_answer_id) {
        await admin
          .from('answers')
          .update({ is_accepted: false })
          .eq('question_id', answer.question_id)
      }

      // Mark this answer as accepted
      await admin.from('answers').update({ is_accepted: true }).eq('id', answerId)
      await admin.from('questions').update({ accepted_answer_id: answerId }).eq('id', answer.question_id)

      // Award reputation to answer author (+15)
      try {
        await admin.rpc('increment_reputation', {
          target_user_id: answer.author_id,
          amount: REPUTATION_VALUES.ANSWER_ACCEPTED,
        })
      } catch {
        const { data: prof } = await admin.from('profiles').select('reputation').eq('id', answer.author_id).single()
        if (prof) {
          await admin.from('profiles').update({ reputation: prof.reputation + REPUTATION_VALUES.ANSWER_ACCEPTED }).eq('id', answer.author_id)
        }
      }

      // Award reputation to question author (+2 for selecting an accepted answer)
      if (user.id !== answer.author_id) {
        try {
          await admin.rpc('increment_reputation', {
            target_user_id: user.id,
            amount: REPUTATION_VALUES.ACCEPT_ANSWER,
          })
        } catch {
          const { data: prof } = await admin.from('profiles').select('reputation').eq('id', user.id).single()
          if (prof) {
            await admin.from('profiles').update({ reputation: prof.reputation + REPUTATION_VALUES.ACCEPT_ANSWER }).eq('id', user.id)
          }
        }

        // Notify answer author
        await admin.from('notifications').insert({
          user_id: answer.author_id,
          type: 'answer_accepted',
          title: '🎉 Your answer was accepted!',
          body: `Your answer on "${answer.question.title.slice(0, 50)}..." earned you +15 reputation!`,
          link: `/questions/${answer.question_id}`,
        })
      }

      return NextResponse.json({ accepted: true })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
