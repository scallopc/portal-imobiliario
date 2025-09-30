'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
  phoneNumber?: string;
  message?: string;
}

export function WhatsAppButton({
  variant = 'default',
  size = 'default',
  className = '',
  children,
  phoneNumber = '5521987372359', // Número padrão do Brasil
  message = 'Olá! Gostaria de saber mais sobre os imóveis disponíveis.'
}: WhatsAppButtonProps) {
  
  const handleWhatsAppClick = () => {
    // Formatar número para WhatsApp (remover caracteres especiais)
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Criar mensagem codificada para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Criar URL do WhatsApp
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleWhatsAppClick}
      className={`${className}`}
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {children || 'Falar no WhatsApp'}
    </Button>
  );
}
