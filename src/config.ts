export type SocialPlatform = 'Instagram' | 'Facebook' | 'Messenger';

export interface SiteConfig {
  brandName: string;
  tagline: string;
  aboutText: string;
  socials: Array<{ platform: SocialPlatform; url: string; color: string }>;
  cakeImages: string[];
}

const env = import.meta.env;

export const config: SiteConfig = {
  brandName: env.VITE_BRAND_NAME || 'NT Element Cakes',
  tagline:
    env.VITE_TAGLINE ||
    'Handmade tiramisu, made in Australia.',
  aboutText:
    env.VITE_ABOUT_TEXT ||
    'Small-batch tiramisu, cocoa-dusted and coffee-soaked. Tap any slice to see it up close, then order on your favourite app.',
  socials: [
    {
      platform: 'Instagram',
      url: env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/ntelementcakes/',
      color: '#E9B8CF'
    },
    {
      platform: 'Facebook',
      url: env.VITE_FACEBOOK_URL || 'https://www.facebook.com/ntelementcakes/',
      color: '#9EC5FF'
    },
    {
      platform: 'Messenger',
      url: env.VITE_MESSENGER_URL || 'https://m.me/ntelementcakes',
      color: '#B9F2FF'
    }
  ],
  cakeImages: [
    '/cakes/753732979_1350799103807430_7873787001468322305_n.jpg',
    '/cakes/751134583_3211594029033514_8016886532644501009_n.jpg',
    '/cakes/755380798_1019663917494688_2718437872776743684_n.jpg',
    '/cakes/754724833_2957078267962681_4754883315427519400_n.jpg',
    '/cakes/750919848_1381880933881956_7595615374698156883_n.jpg',
    '/cakes/750717223_1077956308505182_6162705914576579385_n.jpg',
    '/cakes/753662785_1084920284200451_1877320936906446710_n.jpg',
    '/cakes/751882791_1695033578247680_5279838039107148449_n.jpg',
    '/cakes/750864121_1766027041353962_5664451379473748334_n.jpg',
    '/cakes/752150735_1460443102514118_3095273935556678092_n.jpg',
    '/cakes/752807170_928127383670878_7984085609858838846_n.jpg'
  ]
};
