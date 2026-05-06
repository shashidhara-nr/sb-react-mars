import React from 'react';
import { FormProvider, UseFormReturn } from 'react-hook-form';

interface RHFProviderProps {
  methods: UseFormReturn<any>;
  onSubmit: (data: any) => void;
  children: React.ReactNode;
  asForm?: boolean;
}

const RHFProvider: React.FC<RHFProviderProps> = ({ methods, onSubmit, children, asForm = true }) => {
  return (
    <FormProvider {...methods}>
      {asForm ? (
        <form onSubmit={methods.handleSubmit(onSubmit)}>{children}</form>
      ) : (
        <>{children}</>
      )}
    </FormProvider>
  );
};

export default RHFProvider;
