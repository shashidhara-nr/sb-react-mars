/**
 * BopThirdPartyIntegrationExample.tsx
 * 
 * Example component demonstrating how to use the useBopThirdParty hook
 * with the BOP Third Party slice for state management.
 * 
 * This can be integrated into BOP third party pages:
 * - /setup-and-admin/bop-third-parties/create
 * - /setup-and-admin/bop-third-parties/details
 * - /setup-and-admin/bop-third-parties/manage
 */

'use client';

import React, { useEffect } from 'react';
import { useBopThirdParty } from '@lib/hooks/useBopThirdParty';
import { Box, CircularProgress, Alert } from '@mui/material';
import { Button } from 'dist/standard-bank-react';

// Example 1: Creating a new BOP third party
export function CreateBopThirdPartyExample() {
  const {
    bopThirdParty,
    isLoading,
    error,
    updateField,
    updateObject,
    resetData,
    createBopThirdPartyRequest,
    clearErrorMessage,
  } = useBopThirdParty();

  // Update simple field
  const handleFirstNameChange = (value: string) => {
    updateField('firstName', value);
  };

  // Update nested object field
  const handleAddressChange = (field: string, value: string) => {
    updateObject(['address', field], value);
  };

  // Submit the BOP third party
  const handleSubmit = async () => {
    try {
      await createBopThirdPartyRequest();
      console.log('BOP third party created successfully!');
      // Redirect or show success message
    } catch (err) {
      console.error('Failed to create BOP third party:', err);
    }
  };

  // Reset form
  const handleReset = () => {
    resetData();
  };

  return (
    <Box>
      {isLoading && <CircularProgress />}
      {error && (
        <Alert severity="error" onClose={clearErrorMessage}>
          {error}
        </Alert>
      )}
      
      <div>
        {/* Example form fields integrated with the hook */}
        <input
          type="text"
          value={bopThirdParty.firstName || ''}
          onChange={(e) => handleFirstNameChange(e.target.value)}
          placeholder="First Name"
        />
        
        <input
          type="text"
          value={bopThirdParty.address?.addressLine1 || ''}
          onChange={(e) => handleAddressChange('addressLine1', e.target.value)}
          placeholder="Address Line 1"
        />
        
        <Button onClick={handleSubmit} disabled={isLoading}>
          Submit
        </Button>
        
        <Button onClick={handleReset}>
          Reset
        </Button>
      </div>
    </Box>
  );
}

// Example 2: Managing an existing BOP third party
export function ManageBopThirdPartyExample({ thirdPartyId }: { thirdPartyId: string }) {
  const {
    managedBopThirdParty,
    isLoading,
    error,
    updateManagedField,
    updateManagedObject,
    getBopThirdPartyById,
    updateBopThirdPartyRequest,
    deleteBopThirdPartyRequest,
    resetManagedData,
  } = useBopThirdParty();

  // Fetch BOP third party on mount
  useEffect(() => {
    if (thirdPartyId) {
      getBopThirdPartyById(thirdPartyId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thirdPartyId]);

  // Update managed third party field
  const handleFieldUpdate = (field: string, value: any) => {
    updateManagedField(field, value);
  };

  // Update nested field
  const handleAddressUpdate = (field: string, value: string) => {
    updateManagedObject(['address', field], value);
  };

  // Save changes
  const handleSave = async () => {
    try {
      await updateBopThirdPartyRequest(thirdPartyId);
      console.log('BOP third party updated successfully!');
    } catch (err) {
      console.error('Failed to update BOP third party:', err);
    }
  };

  // Delete third party
  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this BOP third party?')) {
      try {
        await deleteBopThirdPartyRequest(thirdPartyId);
        console.log('BOP third party deleted successfully!');
        // Redirect to list page
      } catch (err) {
        console.error('Failed to delete BOP third party:', err);
      }
    }
  };

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box>
      <div>
        <h2>Manage BOP Third Party: {managedBopThirdParty.firstName} {managedBopThirdParty.lastName}</h2>
        
        {/* Example form fields */}
        <input
          type="text"
          value={managedBopThirdParty.firstName || ''}
          onChange={(e) => handleFieldUpdate('firstName', e.target.value)}
          placeholder="First Name"
        />
        
        <input
          type="text"
          value={managedBopThirdParty.address?.addressLine1 || ''}
          onChange={(e) => handleAddressUpdate('addressLine1', e.target.value)}
          placeholder="Address Line 1"
        />
        
        <Button onClick={handleSave}>
          Save Changes
        </Button>
        
        <Button onClick={handleDelete} buttonVariant="secondary">
          Delete
        </Button>
      </div>
    </Box>
  );
}

// Example 3: Integration with React Hook Form
export function BopThirdPartyWithRHFExample() {
  const {
    bopThirdParty,
    updateField,
    updateObject,
    createBopThirdPartyRequest,
  } = useBopThirdParty();

  // When form values change, update Redux state
  const handleFormChange = (name: string, value: any) => {
    // Check if it's a nested field (e.g., 'address.addressLine1')
    if (name.includes('.')) {
      const parts = name.split('.');
      updateObject(parts, value);
    } else {
      updateField(name, value);
    }
  };

  // On submit, use the Redux state
  const handleSubmit = async () => {
    try {
      // The bopThirdParty from Redux already has all the form data
      await createBopThirdPartyRequest(bopThirdParty);
      console.log('Submitted successfully!');
    } catch (err) {
      console.error('Submission failed:', err);
    }
  };

  return (
    <Box>
      {/* Your React Hook Form fields here, calling handleFormChange on change */}
      <Button onClick={handleSubmit}>
        Submit
      </Button>
    </Box>
  );
}

/**
 * INTEGRATION GUIDE:
 * 
 * 1. For create flow (details page):
 *    - Use: bopThirdParty, updateField, updateObject, createBopThirdPartyRequest
 *    - Call updateField/updateObject when form values change
 *    - Call createBopThirdPartyRequest on submit
 * 
 * 2. For manage flow (manage page):
 *    - Use: managedBopThirdParty, getBopThirdPartyById, updateManagedField, 
 *           updateManagedObject, updateBopThirdPartyRequest, deleteBopThirdPartyRequest
 *    - Call getBopThirdPartyById on page load with ID from URL
 *    - Use updateManagedField/updateManagedObject for form changes
 *    - Call updateBopThirdPartyRequest to save changes
 *    - Call deleteBopThirdPartyRequest to delete
 * 
 * 3. With React Hook Form:
 *    - Call updateField/updateObject in onChange handlers
 *    - The Redux state will sync with form state
 *    - Submit directly from Redux state
 * 
 * 4. State persistence:
 *    - BOP third party state is persisted via redux-persist
 *    - Data survives page refreshes
 *    - Call resetData() or resetManagedData() to clear
 */
