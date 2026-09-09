/* ═══════════════════════════════════════════════════════════
   Signvel — runtime configuration

   The only file you edit by hand. Both values below are meant to be
   public: the publishable key identifies the project, it does not grant
   access. Every table is protected by the Row Level Security policies in
   supabase/schema.sql, so a visitor holding this key still sees nothing
   that is not theirs.

   NEVER put the secret key (sb_secret_… or service_role) in this file.
   It bypasses every one of those policies. It belongs only in Edge
   Function environment variables, set through the Supabase dashboard.
   ═══════════════════════════════════════════════════════════ */

window.SIGNVEL_CONFIG = {
  supabaseUrl: 'https://pllnhgbbtbosgwhgqkdg.supabase.co',
  supabaseKey: 'sb_publishable_fJvc6IXi6MeftioqZgQpRQ_ewPe3KcU',

  // Stripe publishable key and price ids go here once the products exist.
  stripeKey: '',
  prices: { team_monthly: '', team_yearly: '', org: '' },
};
