export interface SiteConfig {
  brandName: string;
  tagline: string;
  instagramUrl: string;
  facebookUrl: string;
  messengerUrl: string;
  aboutText: string;
}

const env = import.meta.env;

export const config: SiteConfig = {
  brandName: env.VITE_BRAND_NAME || 'NT Element Cakes',
  tagline: env.VITE_TAGLINE || 'Pick me up — handcrafted tiramisu cakes in Australia',
  instagramUrl: env.VITE_INSTAGRAM_URL || 'https://instagram.com/ntelementcakes',
  facebookUrl: env.VITE_FACEBOOK_URL || 'https://facebook.com/ntelementcakes',
  messengerUrl: env.VITE_MESSENGER_URL || 'https://m.me/ntelementcakes',
  aboutText:
    env.VITE_ABOUT_TEXT ||
    'NT Element Cakes creates small-batch tiramisu cakes with a soft mascarpone heart, deep coffee notes, and cocoa-dusted finishes made for celebrations, gifting, and late-night cravings. Browse the reveal, then message us on social to order.',
};
