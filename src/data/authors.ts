import { Author, Product } from '@/lib/types';
import { assetUrl } from '@/lib/utils';
import { products } from './products';

export const authors: Author[] = [
  {
    slug: 'alex-rivera',
    name: 'Alex Rivera',
    photo: assetUrl('/images/author-alex.jpg'),
    bio: 'Alex is a travel tech journalist and product reviewer with over 10 years of experience testing gear across six continents. From carry-on luggage to noise-cancelling earbuds, he\'s reviewed hundreds of products with a focus on real-world performance for frequent travelers and digital nomads. His reviews are known for their thoroughness, honesty, and practical perspective.',
    expertise: ['Travel Gear', 'Electronics', 'Audio'],
    reviewCount: 62,
    socialLinks: {
      twitter: 'https://twitter.com/alexrivera',
      linkedin: 'https://linkedin.com/in/alexrivera',
    },
  },
  {
    slug: 'maya-chen',
    name: 'Maya Chen',
    photo: assetUrl('/images/author-maya.jpg'),
    bio: 'Maya is a certified ergonomist and wellness tech specialist who has been reviewing fitness, home office, and outdoor gear since 2019. With a background in kinesiology and a passion for optimizing workspaces and recovery routines, she brings a unique health-first perspective to product reviews. When she\'s not testing standing desks or massage guns, you\'ll find her hiking trails with her rescue dog.',
    expertise: ['Fitness', 'Home Office', 'Outdoor'],
    reviewCount: 48,
    socialLinks: {
      twitter: 'https://twitter.com/mayachenreviews',
      linkedin: 'https://linkedin.com/in/mayachen',
    },
  },
];

export function getAuthorBySlug(slug: string): Author | undefined {
  return authors.find((a) => a.slug === slug);
}

export function getAuthorProducts(authorSlug: string): Product[] {
  return products.filter((p) => p.authorSlug === authorSlug);
}
