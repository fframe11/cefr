import { createApiHandler } from '../_lib/handler/api-handler';
import { createServiceRoleClient } from '../_lib/supabase/client';
import { BadRequestError, NotFoundError } from '../_lib/errors/api-error';
import { uuidSchema } from '../_lib/validation/common-schemas';
import { STORAGE_BUCKETS, getPublicAudioUrl } from '../../lib/storage/audio';

export default createApiHandler(
  async ({ req }) => {
    const rawId =
      (req.query?.id as string) ||
      new URL(req.url || '/', 'http://localhost').searchParams.get('id');

    if (!rawId || (typeof rawId === 'string' && rawId.trim() === '')) {
      throw new BadRequestError('Exercise ID parameter is required.');
    }

    const uuidValidation = uuidSchema.safeParse(rawId.trim());
    if (!uuidValidation.success) {
      throw new BadRequestError('Invalid exercise ID format. Must be a valid UUID.');
    }

    const exerciseId = uuidValidation.data;
    const supabase = createServiceRoleClient();
    const { data: exercise, error } = await supabase
      .from('listening_exercises')
      .select('id, title, audio_storage_path, is_active')
      .eq('id', exerciseId)
      .maybeSingle();

    if (error || !exercise || exercise.is_active === false) {
      throw new NotFoundError('Listening exercise not found.');
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://atmatooytieelwiarffp.supabase.co';
    const audioUrl = exercise.audio_storage_path
      ? getPublicAudioUrl(
          supabaseUrl,
          STORAGE_BUCKETS.LISTENING,
          exercise.audio_storage_path
        )
      : null;

    return {
      exercise_id: exercise.id,
      title: exercise.title,
      audio_url: audioUrl,
      has_audio: Boolean(audioUrl),
    };
  },
  {
    allowedMethods: ['GET'],
    requireAuth: false,
  }
);
