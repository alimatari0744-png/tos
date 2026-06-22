
REVOKE EXECUTE ON FUNCTION public.has_perm(uuid, text) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.has_perm(uuid, text) TO authenticated, service_role;
