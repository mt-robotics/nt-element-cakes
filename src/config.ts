export type SiteConfig = {
  brandName: string;
  tagline: string;
  instagramUrl: string;
  facebookUrl: string;
  messengerUrl: string;
  aboutText: string;
};

const env = import.meta.env;

export const config: SiteConfig = {
  brandName: env.VITE_BRAND_NAME || 'NT Element Cakes',
  tagline: env.VITE_TAGLINE || 'Pick me up',
  instagramUrl: env.VITE_INSTAGRAM_URL || 'https://instagram.com/ntelementcakes',
  facebookUrl: env.VITE_FACEBOOK_URL || 'https://facebook.com/ntelementcakes',
  messengerUrl: env.VITE_MESSENGER_URL || 'https://m.me/ntelementcakes',
  aboutText:
    env.VITE_ABOUT_TEXT ||
    'Small-batch tiramisu cakes made in Australia with clouds of mascarpone, deep coffee-soaked layers, and cocoa-dusted finishes. Browse the layers, choose your favourite, then message us on social to order.'
};
