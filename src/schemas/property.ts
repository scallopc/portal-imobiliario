export type AddressSchema = {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
};

export type PropertyBaseSchema = {
  code: string;
  slug: string;
  title: string;
  description: string;
  propertyType: string;
  status: string;
  price: string;
  estimatedPrice: string; 
  totalArea: number;
  privateArea: number;
  usefulArea: number;
  bedrooms: number;
  bathrooms: number;
  suites: number;
  suiteDetails: string;
  parkingSpaces: number;
  furnished: boolean;
  address: AddressSchema;
  features: string[];
  images: string[];
  videoUrl: string;
  virtualTourUrl: string;
  seo: string;
};
