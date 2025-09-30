'use client';

import React from 'react';
import { useProperty } from '@/hooks/queries/use-property';
import { ImageGallery } from '@/components/common/ImageGallery';
import { EmbedPlayer } from '@/components/properties/EmbedPlayer';
import { Loader2, AlertTriangle, MapPin, Bed, Bath, Car, Square, Tag, Building, Info, Youtube, Camera, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Head from 'next/head';

interface PropertyDetailPageProps {
  params: {
    id: string;
  };
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number | undefined }) => (
  <div className="flex items-center gap-4 text-base">
    <div className="bg-accent/10 text-accent p-3 rounded-lg">
      <Icon className="w-5 h-5" />
    </div>
    <div>
      <p className="text-muted-foreground font-medium">{label}</p>
      <p className="font-bold text-lg text-card-foreground">{value || 'N/A'}</p>
    </div>
  </div>
);

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { data: property, isLoading, error } = useProperty(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-accent" />
          <p className="text-lg text-muted-foreground">Carregando detalhes do imóvel...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <AlertTriangle className="w-12 h-12 text-destructive" />
          <h2 className="text-2xl font-bold text-destructive">Erro ao Carregar</h2>
          <p className="text-lg text-muted-foreground max-w-md">{error.message}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </div>
      </div>
    );
  }

  if (!property) {
    return null; // ou um estado de 'não encontrado' mais elaborado
  }

  return (
    <>
     <Head>
        <title>{property?.title } - Zona Sul RJ</title>
        <meta
          name="description"
          content={property?.seo}
        />
      </Head>
    
    <div className="bg-background text-foreground pt-24 md:pt-32">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/property">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Imóveis
            </Button>
          </Link>
        </div>
        
        {/* Header */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-card-foreground leading-tight mb-2">{property.title}</h1>
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <MapPin className="w-5 h-5 text-accent" />
            <span>{`${property.address?.neighborhood}`.trim() || property.address?.city || 'Localização não informada'}</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column (Gallery & Details) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <ImageGallery 
              images={property.images} 
              alt={property.title} 
            />

            <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Info className="w-6 h-6 text-accent" />
                  Descrição do Imóvel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">
                  {property.description || 'Nenhuma descrição disponível.'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Building className="w-6 h-6 text-accent" />
                  Características
                </CardTitle>
              </CardHeader>
              <CardContent>
                {property.features && property.features.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {property.features.map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-base px-4 py-2 border-accent/20 bg-accent/10 text-accent">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhuma característica adicional informada.</p>
                )}
              </CardContent>
            </Card>

            {/* Video Section */}
            {property.videoUrl && (
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Youtube className="w-6 h-6 text-accent" />
                    Vídeo de Apresentação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmbedPlayer src={property.videoUrl} title="Vídeo de Apresentação do Imóvel" />
                </CardContent>
              </Card>
            )}

            {/* Virtual Tour Section */}
            {property.virtualTourUrl && (
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Camera className="w-6 h-6 text-accent" />
                    Tour Virtual 360°
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmbedPlayer src={property.virtualTourUrl} title="Tour Virtual do Imóvel" />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column (Summary & Contact) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-8">
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="text-center">
                  <p className="text-muted-foreground text-lg">Valor de Venda</p>
                  <p className="text-4xl font-extrabold text-accent">{formatPrice(property.price || 0)}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <Separator className="bg-accent/20" />
                  <div className="grid grid-cols-2 gap-6">
                    <DetailItem icon={Bed} label="Quartos" value={property.bedrooms} />
                    <DetailItem icon={Bath} label="Banheiros" value={property.bathrooms} />
                    <DetailItem icon={Square} label="Área Total" value={`${property.totalArea} m²`} />
                    <DetailItem icon={Car} label="Vagas" value={property.parkingSpaces} />
                    <DetailItem icon={Tag} label="Tipo" value={property.type} />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Ficou interessado?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground mb-6">
                    Nossa concierge Jade IA pode te ajudar a agendar uma visita ou tirar suas dúvidas.
                  </p>
                  <Button size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6 font-bold">
                    Falar com a Jade
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>

  );
}

