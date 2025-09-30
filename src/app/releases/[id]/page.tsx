'use client';

import React from 'react';
import { useRelease } from '@/hooks/queries/use-release';
import { ImageGallery } from '@/components/common/ImageGallery';
import { Loader2, AlertTriangle, MapPin, Building, Users, Calendar, Tag, Square, Car, Bed, Bath, Info, ArrowLeft, Youtube, Camera } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import Head from 'next/head';
import { EmbedPlayer } from '@/components/properties/EmbedPlayer';

interface ReleaseDetailPageProps {
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

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
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

const UnitCard = ({ unit }: { unit: any }) => (
  <Card className="border-accent/20 bg-card/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
    <CardContent className="p-4">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-bold text-lg text-card-foreground">Unidade {unit.unit}</h4>
          <Badge 
            variant={unit.status === 'Disponível' ? 'default' : 'secondary'}
            className={`${
              unit.status === 'Disponível' 
                ? 'bg-green-100 text-green-800 border-green-200' 
                : 'bg-orange-100 text-orange-800 border-orange-200'
            }`}
          >
            {unit.status}
          </Badge>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-accent">{formatPrice(unit.price || 0)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Bed className="w-4 h-4 text-muted-foreground" />
          <span>{unit.bedrooms || 0} quartos</span>
        </div>
        <div className="flex items-center gap-2">
          <Square className="w-4 h-4 text-muted-foreground" />
          <span>{unit.privateArea || 0} m²</span>
        </div>
        <div className="flex items-center gap-2">
          <Car className="w-4 h-4 text-muted-foreground" />
          <span>{unit.parkingSpaces || 'à consultar'} vagas</span>
        </div>
        <div className="flex items-center gap-2">
          <Bath className="w-4 h-4 text-muted-foreground" />
          <span>{unit.bathrooms || 'à consultar' } banheiros</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function ReleaseDetailPage({ params }: ReleaseDetailPageProps) {
  const { data: release, isLoading, error } = useRelease(params.id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-accent" />
          <p className="text-lg text-muted-foreground">Carregando detalhes do lançamento...</p>
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

  if (!release) {
    return null;
  }

  const availableUnits = release.units?.filter((unit: any) => unit.status === 'Disponível') || [];
  const minPrice = availableUnits.length > 0 
    ? Math.min(...availableUnits.map((unit: any) => unit.price || 0).filter((price: number) => price > 0))
    : release.minUnitPrice || 0;

  return (
    <>
    <Head>
       <title>{release?.title } - Zona Sul RJ</title>
       <meta
         name="description"
         content={release?.seo}
       />
     </Head>
    <div className="bg-background text-foreground pt-24 md:pt-32">
      <div className="container mx-auto px-4 py-12 md:py-16">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/releases">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Voltar aos Lançamentos
            </Button>
          </Link>
        </div>

        {/* Header */}
        <header className="mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-card-foreground leading-tight mb-2">{release.title}</h1>
          <div className="flex items-center gap-2 text-lg text-muted-foreground">
            <MapPin className="w-5 h-5 text-accent" />
            <span>{`${release.address?.neighborhood || release.address?.city || 'Localização não informada'}`.trim()}</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Left Column (Gallery & Details) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <ImageGallery 
              images={release.images || []} 
              alt={release.title || 'Lançamento'} 
            />

            <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Info className="w-6 h-6 text-accent" />
                  Sobre o Empreendimento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-base leading-relaxed whitespace-pre-wrap">
                  {release.description || 'Nenhuma descrição disponível.'}
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
                {release.features && release.features.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {release.features.map((feature: string) => (
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
            {release.videoUrl && (
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Youtube className="w-6 h-6 text-accent" />
                    Vídeo de Apresentação
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmbedPlayer src={release.videoUrl} title="Vídeo de Apresentação do Imóvel" />
                </CardContent>
              </Card>
            )}

            {/* Virtual Tour Section */}
            {release.virtualTourUrl && (
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Camera className="w-6 h-6 text-accent" />
                    Tour Virtual 360°
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <EmbedPlayer src={release.virtualTourUrl} title="Tour Virtual do Imóvel" />
                </CardContent>
              </Card>
            )}
            {/* Units Section */}
            {availableUnits.length > 0 && (
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Building className="w-6 h-6 text-accent" />
                    Unidades Disponíveis ({availableUnits.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableUnits.slice(0, 6).map((unit: any) => (
                      <UnitCard key={unit.id} unit={unit} />
                    ))}
                  </div>
                  {availableUnits.length > 6 && (
                    <p className="text-center text-muted-foreground mt-4">
                      E mais {availableUnits.length - 6} unidades disponíveis...
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            {/* Floor Plans Section */}
            {release.floorPlans && release.floorPlans.length > 0 && (
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-2xl">
                    <Building className="w-6 h-6 text-accent" />
                    Plantas do Empreendimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ImageGallery 
                    images={release.floorPlans || []}
                    alt="Plantas do Empreendimento"
                  />
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column (Summary & Contact) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 flex flex-col gap-8">
              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm shadow-lg">
                <CardHeader className="text-center">
                  <p className="text-muted-foreground text-lg">A partir de</p>
                  <p className="text-4xl font-extrabold text-accent">{formatPrice(minPrice)}</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    {availableUnits.length} unidades disponíveis
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-6">
                  <Separator className="bg-accent/20" />
                  <div className="grid grid-cols-1 gap-6">
                    <DetailItem 
                      icon={Building} 
                      label="Total de Unidades" 
                      value={release.unitsCount || release.units?.length || 0} 
                    />
                    <DetailItem 
                      icon={Users} 
                      label="Unidades Disponíveis" 
                      value={availableUnits.length} 
                    />
                    <DetailItem 
                      icon={Calendar} 
                      label="Lançamento" 
                      value={release.createdAt ? formatDate(release.createdAt) : 'N/A'} 
                    />
                    <DetailItem 
                      icon={MapPin} 
                      label="Localização" 
                      value={release.address?.neighborhood || release.address?.city || 'N/A'} 
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-accent/20 bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">Ficou interessado?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground mb-6">
                    Nossa concierge Jade IA pode te ajudar a agendar uma visita ou tirar suas dúvidas sobre este lançamento.
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
