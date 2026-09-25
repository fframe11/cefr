import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { BadRequestError, NotFoundError } from '../_lib/errors/api-error';
import { STORAGE_BUCKETS, getPublicAudioUrl } from '../../lib/storage/audio';

export default createApiHandler(
  async ({ req }) => {
    const url = new URL(req.url || '/', 'http://localhost');
    const exerciseId = url.searchParams.get('id');

    if (!exerciseId) {
      throw new BadRequestError('Exercise ID parameter is required.');
    }

    const supabase = createServiceRoleClient();
    const { data: exercise, error } = await supabase
      .from('listening_exercises')
      .select('id, title_en, audio_path, duration_seconds')
      .eq('id', exerciseId)
      .single();

    if (error || !exercise) {
      throw new NotFoundError('Listening exercise not found.');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atmatooytieelwiarffp.supabase.co';
    const audioUrl = getPublicAudioUrl(
      supabaseUrl,
      STORAGE_BUCKETS.LISTENING,
      exercise.audio_path
    );

    return {
      exercise_id: exercise.id,
      title: exercise.title_en,
      audio_url: audioUrl,
      duration_seconds: exercise.duration_seconds,
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
  }
);
