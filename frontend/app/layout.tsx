import './globals.css';
import type { Metadata } from 'next';
export const metadata:Metadata={title:'Revel Mix Revestimentos Ltda',description:'Revestimentos industriais e residenciais desde 2008. Uretano, piso epóxi e tecnocimento.',keywords:['revestimento industrial','piso epóxi','uretano','cimento queimado','São Paulo'],openGraph:{title:'Revel Mix Revestimentos Ltda',description:'Qualidade, resistência e acabamento impecável.',type:'website'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="pt-BR"><body>{children}</body></html>}
