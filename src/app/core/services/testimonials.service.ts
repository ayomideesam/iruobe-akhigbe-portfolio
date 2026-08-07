// core/services/testimonials.service.ts
//
// Single source for the real LinkedIn recommendations. Previously this array
// lived inline in HomeComponent; the services route needs the same data, and two
// hardcoded copies would drift. Quotes are verbatim from LinkedIn — do not
// paraphrase, shorten or fabricate entries.

import { Injectable } from '@angular/core';

export interface Testimonial {
   quote: string;
   author: string;
   role: string;
   company: string;
   initials: string;
   relationship: string;
}

@Injectable({ providedIn: 'root' })
export class TestimonialsService {

   private static readonly GRADIENTS = [
      'linear-gradient(135deg,#818cf8,#6366f1)',
      'linear-gradient(135deg,#22d3ee,#0891b2)',
      'linear-gradient(135deg,#34d399,#059669)',
      'linear-gradient(135deg,#f59e0b,#d97706)',
      'linear-gradient(135deg,#f472b6,#db2777)'
   ];

   private readonly testimonials: Testimonial[] = [
      {
         quote: 'I highly recommend Akhigbe Iruobe as a Senior Frontend Engineer. Although he doesn\'t manage me directly, he has consistently supported me with code reviews, logic improvements, and technical guidance. He\'s intuitive, reliable, and always delivers high-quality work. What stands out most is his willingness to help — he\'s always open to assisting others and explaining complex concepts clearly. He\'s a strong team player and a valuable asset to any engineering team.',
         author: 'Nonye Ibeanu', role: 'Frontend Engineer', company: 'Globus Bank', initials: 'NI',
         relationship: 'Senior colleague at Globus Bank'
      },
      {
         quote: 'I\'ve had the pleasure of working with Akhigbe Iruobe, and he consistently demonstrates professionalism, reliability, and strong attention to detail. He takes ownership of his work and always delivers quality results. I highly recommend him to any team looking for someone dependable and growth-driven.',
         author: 'Ekop Takon', role: 'Frontend Developer', company: 'Globus Bank', initials: 'ET',
         relationship: 'Direct report at Globus Bank'
      },
      {
         quote: 'I can speak confidently on Ayomide\'s web development skills having worked with him at Upperlink to build several top-notch software solutions. Ayomide is very dedicated and approaches his tasks with an uncommon enthusiasm. Simply put, you can always count on him to deliver. Highly proficient technical skills equally matched with friendliness — this makes him great at working independently and in a team. Any organisation will be lucky to have him join them.',
         author: 'Adefisola Adigun', role: 'Backend Developer', company: 'Upperlink LTD', initials: 'AA',
         relationship: 'Worked together at Upperlink'
      },
      {
         quote: 'I had the pleasure of working with AY, and I can confidently say he is an outstanding Frontend Developer. He has a strong eye for detail and a natural ability to transform ideas and designs into smooth, user-friendly experiences. What stands out most is how he balances creativity with functionality — delivering clean, responsive interfaces while maintaining performance and usability. He communicates clearly, collaborates well, and takes full ownership of his work.',
         author: 'Victor Johnson', role: 'Backend Architect', company: 'Zenith Bank', initials: 'VJ',
         relationship: 'Peer — different teams at Zenith Bank'
      },
      {
         quote: 'I have had the privilege of working closely with Ayomide at Zenith Bank, where he has consistently proven himself as an outstanding Front-End Developer. His skills are truly remarkable — he adeptly combines these technologies to craft seamless and visually appealing user interfaces that leave a lasting impression. His technical depth, creativity, and commitment to quality make him a standout in any engineering team.',
         author: 'Adesoji Oyewusi', role: 'UI/UX Designer', company: 'Zenith Bank', initials: 'AO',
         relationship: 'Different team at Zenith Bank'
      }
   ];

   getTestimonials(): Testimonial[] {
      return this.testimonials;
   }

   getGradient(index: number): string {
      return TestimonialsService.GRADIENTS[index % TestimonialsService.GRADIENTS.length];
   }
}
