import type { Metadata } from 'next'
import { Playfair_Display, Tajawal } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const tajawal = Tajawal({ 
  subsets: ['arabic'],
  variable: '--font-tajawal',
  display: 'swap',
  weight: ['300', '400', '500', '700', '800', '900']
})

export const metadata: Metadata = {
  title: 'FinClick.AI - Revolutionary AI-Powered Financial Analysis',
  description: 'Advanced financial analysis platform with 181 types of analysis powered by AI',
  keywords: 'financial analysis, AI, artificial intelligence, تحليل مالي, ذكاء اصطناعي',
  authors: [{ name: 'FinClick.AI' }],
  viewport: 'width=device-width, initial
