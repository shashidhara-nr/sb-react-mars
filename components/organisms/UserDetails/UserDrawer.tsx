'use client';

import { Box, Typography, Divider, Stack, IconButton, Button } from '@mui/material';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export default function ManagePasswordTable() {
  return (
    <Box
      sx={{
        border: '1px solid #C9CED6',
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: '#fff',
      }}
    >
      {/* ===== Header ===== */}
      <Box sx={{ px: 3, py: 2 }}>
        <Typography variant="h6" fontWeight={600}>
          Manage password
        </Typography>
      </Box>

      <Divider />

      {/* ===== Table Header ===== */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Box flex={1.2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography fontWeight={600}>Credential</Typography>
              <Stack spacing={0} lineHeight={0}>
                <IconButton size="small">
                  <ArrowDropUpIcon color="primary" />
                </IconButton>
                <IconButton size="small">
                  <ArrowDropDownIcon sx={{ color: '#B0B7C3' }} />
                </IconButton>
              </Stack>
            </Stack>
          </Box>

          <Box flex={2}>
            <Typography fontWeight={600}>Last password changed on</Typography>
          </Box>

          <Box flex={2}>
            <Typography fontWeight={600}>Failed login attempts</Typography>
          </Box>

          <Box flex={1}>
            <Typography fontWeight={600}>Status</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: '#6B778C' }} />

      {/* ===== Table Row ===== */}
      <Box sx={{ px: 3, py: 3 }}>
        <Stack direction="row" spacing={3} alignItems="center">
          <Box flex={1.2}>
            <Typography>Password</Typography>
          </Box>

          <Box flex={2}>
            <Typography>Date and time</Typography>
          </Box>

          <Box flex={2}>
            <Typography>0</Typography>
          </Box>

          <Box flex={1}>
            <Typography>Active</Typography>
          </Box>
        </Stack>
      </Box>

      <Divider sx={{ borderColor: '#C9CED6' }} />

      {/* ===== Actions ===== */}
      <Box sx={{ px: 3, py: 2 }}>
        <Stack direction="row" justifyContent="flex-end" spacing={4}>
          <Button variant="text" sx={{ fontWeight: 600 }}>
            RESET PASSWORD
          </Button>
          <Button variant="text" sx={{ fontWeight: 600 }}>
            ACTIVATE
          </Button>
          <Button variant="text" sx={{ fontWeight: 600 }}>
            LOCK
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
