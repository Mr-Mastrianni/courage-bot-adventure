-- Function to initialize progress_tracking column
CREATE OR REPLACE FUNCTION public.init_progress_tracking(user_id_param UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if progress_tracking column exists
  BEGIN
    PERFORM progress_tracking FROM user_profiles LIMIT 1;
  EXCEPTION
    WHEN undefined_column THEN
      -- Column doesn't exist, so create it
      ALTER TABLE public.user_profiles ADD COLUMN progress_tracking JSONB;
  END;
  
  -- Initialize progress_tracking for the specified user
  UPDATE public.user_profiles
  SET progress_tracking = jsonb_build_object(
    'activities', jsonb_build_array(),
    'milestones', jsonb_build_array(),
    'stats', jsonb_build_object(
      'activitiesCompleted', 0,
      'activitiesInProgress', 0,
      'activitiesPlanned', 0
    )
  )
  WHERE user_id = user_id_param AND (progress_tracking IS NULL);
END;
$$;
