import { DefaultSection } from 'next-auth'

declare module 'next-auth' {
  export interface Session {
    user: {
      role: string;
    } & DefaultSection['user'],
  }
}