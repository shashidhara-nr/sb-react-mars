import * as React from "react";
import { useState } from "react";
import { Box, Paper, Button, Stack } from "@mui/material";
import TextField from "@mui/material/TextField";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { DayPicker } from "react-day-picker";
import type { DateRange } from "react-day-picker";
import { format } from "date-fns";
import "react-day-picker/dist/style.css";
import styles from './DateRangePicker.module.scss';

export default function DateRangePicker({ label, placeholder, onChange }: { label?: string; placeholder?: string; onChange?: (range: DateRange) => void }) {
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<DateRange>();
  const [tempRange, setTempRange] = useState<DateRange>();

  const formatValue = (r?: DateRange) => {
    if (!r?.from) return "";
    if (!r.to) return format(r.from, "dd/MM/yyyy");
    return `${format(r.from, "dd/MM/yyyy")} - ${format(r.to, "dd/MM/yyyy")}`;
  };

  return (
    <Box className={styles.dateRangePicker}>
      <TextField
        label={label}
        value={formatValue(range)}
        placeholder={placeholder ? `${placeholder}...` : label ? `${label}...` : "Select date range..."}
        fullWidth
        variant="outlined"
        onClick={() => {
          setTempRange(range);
          setOpen(true);
        }}
        slotProps={{
          input: {
            readOnly: true,
            endAdornment: (
              <Box className={styles.dateRangePickerIcon}>
                <CalendarTodayIcon fontSize="small" />
              </Box>
            ),
          },
        }}
      />

      {open && (
        <Paper className={styles.dateRangePickerPaper} elevation={6}>
          <DayPicker
            mode="range"
            selected={tempRange}
            onSelect={setTempRange}
            captionLayout="dropdown"
            fromYear={2000}
            toYear={2035}
            styles={{
              caption: {
                display: "flex",
                gap: "8px",
                justifyContent: "center",
              },
              dropdown: {
                padding: "4px 6px",
                borderRadius: "6px",
                border: "1px solid #ccc",
                fontSize: "14px",
              },
              day_selected: { backgroundColor: "#1976d2" },
              day_range_middle: {
                backgroundColor: "#e3f2fd",
                color: "#000",
              },
            }}
          />

          <Stack
            direction="row"
            spacing={1}
            className={styles.dateRangePickerActions}
          >
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!tempRange?.from || !tempRange?.to}
              onClick={() => {
                setRange(tempRange);
                setOpen(false);
                if (onChange && tempRange) {
                  onChange(tempRange);
                }
              }}
            >
              OK
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
