'use client';
import { useRouter } from 'next/navigation';

import React from "react";
import demoData from "./demo-user-account.json";
import { Box, Grid } from "@mui/material";
import { Breadcrumb, Button } from "dist/standard-bank-react";
// Update the import path below to the correct location of Card in your project, for example:
import Card from "components/common/Card";
import Image from "next/image";
import Person_Profile from "public/icons/icn_people_profile.svg";
const breadcrumbLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/setup-and-admin", label: "Setup and admin" },
  { href: "/setup-and-admin/users-account", label: "User accounts hub" },
  { href: "/manage-user-account", label: "Manage user account" },
];

export default function ManageUserAccountPage() {
  const router = useRouter();
  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Breadcrumb links={breadcrumbLinks} />
      <h1 style={{ fontSize: 28, fontWeight: 600, margin: "32px 0 24px 0" }}>
        Manage {demoData.userAccountDetails.userAccountName} user account
      </h1>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
      <Card  title={"User account details"} 
        icon={<Image src={Person_Profile} alt="Person" />}>
        <Grid container spacing={2}>
          <Grid size={{sm:12, md:6}}>
            <div style={{ marginBottom: 8 }}>
              <span>User account name</span>
              <div style={{ fontWeight: 600 }}>{demoData.userAccountDetails.userAccountName}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Start date</span>
              <div style={{ fontWeight: 600 }}>{demoData.userAccountDetails.startDate}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Authorisation class</span>
              <div style={{ fontWeight: 600 }}>{demoData.userAccountDetails.authorisationClass}</div>
            </div>
          </Grid>
          <Grid size={{sm:12, md:6}}>
            <div style={{ marginBottom: 8 }}>
              <span>End date</span>
              <div style={{ fontWeight: 600 }}>{demoData.userAccountDetails.endDate}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Language</span>
              <div style={{ fontWeight: 600 }}>{demoData.userAccountDetails.language}</div>
            </div>
          </Grid>
        </Grid>
      </Card>
      </Box>
      <Box sx={{ p: { xs: 2, md: 4 } }}>
      
      <Card title={"Assigned user and roles"} 
        icon={<Image src={Person_Profile} alt="Person" />}>
        <Grid container spacing={2}>
          <Grid size={{sm:12, md:6}}>
            <div style={{ marginBottom: 8 }}>
              <span>User account ID</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.userAccountId}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>ID number</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.idNumber}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Email address</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.emailAddress}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Admin role</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.adminRole}</div>
            </div>
            <div style={{ marginBottom: 8, display: "flex", alignItems: "center" }}>
              <span>Status</span>
              <span style={{
                marginLeft: 8,
                padding: "2px 12px",
                borderRadius: 12,
                background: "#e6f4ea",
                color: "#1a7f37",
                fontSize: 13,
                fontWeight: 500,
                display: "inline-block"
              }}>
                ● {demoData.assignedUserAndRoles.status}
              </span>
            </div>
          </Grid>
          <Grid size={{sm:12, md:6}}>
            <div style={{ marginBottom: 8 }}>
              <span>User name</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.userName}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Date of birth</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.dateOfBirth}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Mobile phone number</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.mobilePhoneNumber}</div>
            </div>
            <div style={{ marginBottom: 8 }}>
              <span>Roles assigned to this user account</span>
              <div style={{ fontWeight: 600 }}>{demoData.assignedUserAndRoles.rolesAssigned.join(", ")}</div>
            </div>
          </Grid>
        </Grid>
      </Card>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mt: 4, mb: 2 }}>
        <Button
          buttonVariant="text"
          startIcon={<span style={{fontSize:16}}>🗙</span>}
          onClick={() => router.push('/users-account')}
        >
          CANCEL
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button buttonVariant="text" startIcon={<span style={{fontSize:16}}>🗎</span>}>SAVE TO DRAFTS</Button>
          <Button
            buttonVariant="secondary"
            startIcon={<span style={{fontSize:16}}>✎</span>}
            onClick={() => router.push('/edit-user-account')}
          >
            EDIT USER ACCOUNT
          </Button>
          <Button buttonVariant="primary" endIcon={<span style={{fontSize:16}}>→</span>}>SUBMIT USER ACCOUNT FOR APPROVAL</Button>
        </Box>
      </Box>
    </Box>
  );
}
