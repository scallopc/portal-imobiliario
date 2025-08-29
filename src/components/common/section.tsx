import { ReactNode } from 'react';

interface SectionProps {
  children: ReactNode;
  className?: string;
}

export default function Section({ children, className = '' }: SectionProps) {
  return (
    <section className={`relative py-32 overflow-hidden bg-gradient-to-br from-darkBg via-darkRed to-brown ${className}`}>
      {children}
    </section>
  );
}
