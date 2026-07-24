import { supabase } from "@/integrations/supabase/client";

export type OAuthClient = {
  name?: string;
  client_id?: string;
};

export type OAuthAuthorizationDetails = {
  client?: OAuthClient;
  redirect_url?: string;
  redirect_to?: string;
};

export type OAuthRedirect = {
  redirect_url?: string;
  redirect_to?: string;
};

export type OAuthResponse<T> = { data: T | null; error: Error | null };

export const oauthApi = {
  getAuthorizationDetails: async (authorizationId: string): Promise<OAuthResponse<OAuthAuthorizationDetails | OAuthRedirect>> => {
    const api = (supabase.auth as any).oauth;
    return api.getAuthorizationDetails(authorizationId);
  },
  approveAuthorization: async (authorizationId: string): Promise<OAuthResponse<OAuthRedirect>> => {
    const api = (supabase.auth as any).oauth;
    return api.approveAuthorization(authorizationId);
  },
  denyAuthorization: async (authorizationId: string): Promise<OAuthResponse<OAuthRedirect>> => {
    const api = (supabase.auth as any).oauth;
    return api.denyAuthorization(authorizationId);
  },
};
