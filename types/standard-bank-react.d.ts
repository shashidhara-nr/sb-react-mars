declare module '@standard-bank/react' {
  import { ComponentType } from 'react';
  
  export interface BreadcrumbLink {
    label: string;
    href?: string;
  }
  
  export interface BreadcrumbProps {
    links: BreadcrumbLink[];
  }
  
  export const Breadcrumb: ComponentType<BreadcrumbProps>;
  export const HeaderWrapper: ComponentType<any>;
  export const CardWrapper: ComponentType<any>;
  export const PaymentCard: ComponentType<any>;
  export const Heading: ComponentType<any>;
}
