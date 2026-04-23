// app/addresses/page.tsx
"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import {
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useGetAddressesQuery,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from "@/features/address/addressApiService";
import { Address, AddressType, CreateAddressPayload } from "@/interfaces/address.interface";
import { useAppSelector } from "@/lib/store";
import AddIcon from "@mui/icons-material/Add";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PinDropOutlinedIcon from "@mui/icons-material/PinDropOutlined";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// ── Constants ─────────────────────────────────────────────────────────────────
const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ?? "";
const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India center
const MAP_LIBRARIES: ("places" | "geocoding")[] = ["places", "geocoding"];

const ADDRESS_TYPE_OPTIONS: { value: AddressType; label: string; icon: React.ReactNode }[] = [
  { value: "HOME", label: "Home", icon: <HomeOutlinedIcon fontSize="small" /> },
  { value: "WORK", label: "Work", icon: <BusinessOutlinedIcon fontSize="small" /> },
  { value: "OTHER", label: "Other", icon: <LocationOnOutlinedIcon fontSize="small" /> },
];

const INDIA_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
];

// ── Empty form ────────────────────────────────────────────────────────────────
const emptyForm = (): CreateAddressPayload => ({
  label: "Home",
  addressType: "HOME",
  line1: "",
  line2: "",
  landmark: "",
  city: "",
  state: "",
  postcode: "",
  country: "India",
  recipientName: "",
  phone: "",
  latitude: undefined,
  longitude: undefined,
  deliveryInstructions: "",
  isDefault: false,
});

// ── Address type icon ─────────────────────────────────────────────────────────
function AddressTypeIcon({ type }: { type: AddressType }) {
  if (type === "HOME") return <HomeOutlinedIcon fontSize="small" />;
  if (type === "WORK") return <BusinessOutlinedIcon fontSize="small" />;
  return <LocationOnOutlinedIcon fontSize="small" />;
}

// ── Address card ──────────────────────────────────────────────────────────────
function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSettingDefault,
  isDeleting,
}: {
  address: Address;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isSettingDefault: boolean;
  isDeleting: boolean;
}) {
  const theme = useTheme();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
    >
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: `1.5px solid ${
            address.isDefault
              ? theme.palette.primary.main
              : theme.palette.divider
          }`,
          position: "relative",
          transition: "all 0.2s ease",
          background: address.isDefault
            ? alpha(theme.palette.primary.main, 0.03)
            : theme.palette.background.paper,
          "&:hover": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
          },
        }}
      >
        {/* Default badge */}
        {address.isDefault && (
          <Chip
            icon={<CheckCircleIcon sx={{ fontSize: "0.8rem !important" }} />}
            label="Default"
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              height: 22,
              fontSize: "0.65rem",
              fontWeight: 700,
              bgcolor: theme.palette.primary.main,
              color: "white",
              "& .MuiChip-icon": { color: "white" },
            }}
          />
        )}

        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.palette.primary.main,
              flexShrink: 0,
            }}
          >
            <AddressTypeIcon type={address.addressType} />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {address.label}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              {address.recipientName} · {address.phone}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Address lines */}
        <Typography
          variant="body2"
          sx={{ color: theme.palette.text.secondary, lineHeight: 1.6, mb: 1 }}
        >
          {address.line1}
          {address.line2 && `, ${address.line2}`}
          {address.landmark && (
            <Box component="span" sx={{ color: theme.palette.text.disabled }}>
              {" "}· Near {address.landmark}
            </Box>
          )}
          <br />
          {address.city}, {address.state} — {address.postcode}
          <br />
          {address.country}
        </Typography>

        {address.deliveryInstructions && (
          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.disabled,
              fontStyle: "italic",
              display: "block",
              mb: 1,
            }}
          >
            📝 {address.deliveryInstructions}
          </Typography>
        )}

        {address.latitude && address.longitude && (
          <Typography
            variant="caption"
            sx={{ color: theme.palette.success.main, display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <PinDropOutlinedIcon sx={{ fontSize: "0.85rem" }} />
            Location pinned on map
          </Typography>
        )}

        {/* Actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 2,
            pt: 1.5,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tooltip title={address.isDefault ? "Already default" : "Set as default"}>
            <span>
              <IconButton
                size="small"
                onClick={onSetDefault}
                disabled={address.isDefault || isSettingDefault}
                sx={{ color: address.isDefault ? theme.palette.primary.main : theme.palette.text.disabled }}
              >
                {isSettingDefault ? (
                  <CircularProgress size={16} />
                ) : address.isDefault ? (
                  <StarIcon fontSize="small" />
                ) : (
                  <StarBorderIcon fontSize="small" />
                )}
              </IconButton>
            </span>
          </Tooltip>

          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={onEdit} sx={{ color: theme.palette.primary.main }}>
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={onDelete}
                disabled={isDeleting}
                sx={{
                  color: theme.palette.text.disabled,
                  "&:hover": { color: theme.palette.error.main },
                }}
              >
                {isDeleting ? (
                  <CircularProgress size={16} />
                ) : (
                  <DeleteOutlineIcon fontSize="small" />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>
    </motion.div>
  );
}

// ── Map picker component ───────────────────────────────────────────────────────
function MapPicker({
  value,
  onChange,
}: {
  value: { lat: number; lng: number } | null;
  onChange: (coords: { lat: number; lng: number }, address: Partial<CreateAddressPayload>) => void;
}) {
  const theme = useTheme();
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(value);
  const [mapCenter, setMapCenter] = useState(value ?? DEFAULT_CENTER);
  const geocoder = useRef<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (window.google) {
      geocoder.current = new window.google.maps.Geocoder();
    }
  }, []);

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      if (!geocoder.current) return;
      try {
        const result = await geocoder.current.geocode({ location: { lat, lng } });
        const components = result.results[0]?.address_components ?? [];

        const get = (type: string) =>
          components.find((c) => c.types.includes(type))?.long_name ?? "";

        const parsed: Partial<CreateAddressPayload> = {
          line1: [get("street_number"), get("route")].filter(Boolean).join(" "),
          city:
            get("locality") ||
            get("administrative_area_level_2") ||
            get("sublocality_level_1"),
          state: get("administrative_area_level_1"),
          postcode: get("postal_code"),
          country: get("country") || "India",
          latitude: lat,
          longitude: lng,
        };

        onChange({ lat, lng }, parsed);
      } catch {
        onChange({ lat, lng }, { latitude: lat, longitude: lng });
      }
    },
    [onChange]
  );

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMarker({ lat, lng });
      reverseGeocode(lat, lng);
    },
    [reverseGeocode]
  );

  const handleMyLocation = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setMarker({ lat, lng });
        setMapCenter({ lat, lng });
        reverseGeocode(lat, lng);
      },
      () => {}
    );
  }, [reverseGeocode]);

  return (
    <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", border: `1.5px solid ${theme.palette.divider}` }}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: 280 }}
        center={mapCenter}
        zoom={marker ? 16 : 5}
        onClick={handleMapClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {marker && <Marker position={marker} />}
      </GoogleMap>

      <Button
        size="small"
        variant="contained"
        startIcon={<MyLocationIcon fontSize="small" />}
        onClick={handleMyLocation}
        sx={{
          position: "absolute",
          bottom: 12,
          right: 12,
          borderRadius: 2,
          fontSize: "0.75rem",
          py: 0.75,
          boxShadow: "0 2px 12px rgba(0,0,0,0.2)",
        }}
      >
        Use my location
      </Button>

      <Typography
        variant="caption"
        sx={{
          position: "absolute",
          top: 10,
          left: "50%",
          transform: "translateX(-50%)",
          bgcolor: "rgba(0,0,0,0.55)",
          color: "white",
          px: 1.5,
          py: 0.5,
          borderRadius: 1,
          whiteSpace: "nowrap",
        }}
      >
        Click on the map to pin your location
      </Typography>
    </Box>
  );
}

// ── Address form dialog ───────────────────────────────────────────────────────
function AddressFormDialog({
  open,
  onClose,
  editAddress,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  editAddress: Address | null;
  onSuccess: (msg: string) => void;
}) {
  const theme = useTheme();
  const [form, setForm] = useState<CreateAddressPayload>(emptyForm());
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  const [createAddress, { isLoading: isCreating }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdating }] = useUpdateAddressMutation();
  const isLoading = isCreating || isUpdating;

  // Pre-fill form when editing
  useEffect(() => {
    if (editAddress) {
      setForm({
        label: editAddress.label,
        addressType: editAddress.addressType,
        line1: editAddress.line1,
        line2: editAddress.line2 ?? "",
        landmark: editAddress.landmark ?? "",
        city: editAddress.city,
        state: editAddress.state,
        postcode: editAddress.postcode,
        country: editAddress.country,
        recipientName: editAddress.recipientName,
        phone: editAddress.phone,
        latitude: editAddress.latitude ?? undefined,
        longitude: editAddress.longitude ?? undefined,
        deliveryInstructions: editAddress.deliveryInstructions ?? "",
        isDefault: editAddress.isDefault,
      });
      if (editAddress.latitude && editAddress.longitude) {
        setMapCoords({ lat: editAddress.latitude, lng: editAddress.longitude });
      }
    } else {
      setForm(emptyForm());
      setMapCoords(null);
    }
  }, [editAddress, open]);

  const set = (field: keyof CreateAddressPayload) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleMapChange = useCallback(
    (coords: { lat: number; lng: number }, parsed: Partial<CreateAddressPayload>) => {
      setMapCoords(coords);
      setForm((f) => ({
        ...f,
        latitude: coords.lat,
        longitude: coords.lng,
        // Only auto-fill fields that are currently empty
        line1: f.line1 || parsed.line1 || "",
        city: f.city || parsed.city || "",
        state: f.state || parsed.state || "",
        postcode: f.postcode || parsed.postcode || "",
        country: parsed.country || f.country,
      }));
    },
    []
  );

  const handleSubmit = async () => {
    try {
      if (editAddress) {
        await updateAddress({ id: editAddress.id, body: form }).unwrap();
        onSuccess("Address updated successfully");
      } else {
        await createAddress(form).unwrap();
        onSuccess("Address added successfully");
      }
      onClose();
    } catch {
      // error handled by RTK
    }
  };

  const field = (
    label: string,
    fieldKey: keyof CreateAddressPayload,
    props: Partial<React.ComponentProps<typeof TextField>> = {}
  ) => (
    <TextField
      label={label}
      value={form[fieldKey] ?? ""}
      onChange={set(fieldKey)}
      fullWidth
      size="small"
      sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
      {...props}
    />
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          fontFamily: "var(--font-display)",
          fontWeight: 700,
          pb: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        {editAddress ? "Edit Address" : "Add New Address"}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        <Grid container spacing={2.5}>
          {/* ── Map ── */}
          <Grid item xs={12}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: theme.palette.text.primary }}
            >
              📍 Pin your location on the map
            </Typography>
            <MapPicker value={mapCoords} onChange={handleMapChange} />
          </Grid>

          {/* ── Address type + label ── */}
          <Grid item xs={12} sm={6}>
            <TextField
              select
              label="Address Type"
              value={form.addressType}
              onChange={(e) =>
                setForm((f) => ({ ...f, addressType: e.target.value as AddressType }))
              }
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {ADDRESS_TYPE_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {opt.icon}
                    {opt.label}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            {field("Label (e.g. Home, Office, Mom's place)", "label")}
          </Grid>

          {/* ── Recipient ── */}
          <Grid item xs={12} sm={6}>
            {field("Recipient Name", "recipientName")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {field("Phone", "phone", { type: "tel" })}
          </Grid>

          {/* ── Address lines ── */}
          <Grid item xs={12}>
            {field("Address Line 1", "line1")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {field("Address Line 2 (optional)", "line2")}
          </Grid>
          <Grid item xs={12} sm={6}>
            {field("Landmark (optional)", "landmark")}
          </Grid>

          {/* ── City / State / Postcode ── */}
          <Grid item xs={12} sm={4}>
            {field("City", "city")}
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              label="State"
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              fullWidth
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            >
              {INDIA_STATES.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            {field("Postcode", "postcode")}
          </Grid>

          {/* ── Delivery instructions ── */}
          <Grid item xs={12}>
            <TextField
              label="Delivery Instructions (optional)"
              value={form.deliveryInstructions ?? ""}
              onChange={set("deliveryInstructions")}
              fullWidth
              size="small"
              multiline
              rows={2}
              placeholder="e.g. Ring bell twice, leave at door, call on arrival..."
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
            />
          </Grid>

          {/* ── Set as default ── */}
          <Grid item xs={12}>
            <Box
              onClick={() => setForm((f) => ({ ...f, isDefault: !f.isDefault }))}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                p: 1.5,
                borderRadius: 2,
                border: `1.5px solid ${
                  form.isDefault ? theme.palette.primary.main : theme.palette.divider
                }`,
                cursor: "pointer",
                background: form.isDefault
                  ? alpha(theme.palette.primary.main, 0.04)
                  : "transparent",
                transition: "all 0.2s ease",
              }}
            >
              {form.isDefault ? (
                <StarIcon sx={{ color: theme.palette.primary.main }} />
              ) : (
                <StarBorderIcon sx={{ color: theme.palette.text.disabled }} />
              )}
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Set as default address
                </Typography>
                <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                  This will be pre-selected at checkout
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, borderTop: `1px solid ${theme.palette.divider}`, gap: 1 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || !form.line1 || !form.city || !form.postcode || !form.recipientName}
          sx={{ borderRadius: 2, textTransform: "none", minWidth: 120 }}
        >
          {isLoading ? (
            <CircularProgress size={18} sx={{ color: "white" }} />
          ) : editAddress ? (
            "Save Changes"
          ) : (
            "Add Address"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Delete confirm dialog ─────────────────────────────────────────────────────
function DeleteConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading: boolean;
}) {
  const theme = useTheme();
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>
        Delete Address?
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
          This address will be permanently removed. This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: "none" }}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="error"
          disabled={isLoading}
          sx={{ borderRadius: 2, textTransform: "none" }}
        >
          {isLoading ? <CircularProgress size={18} sx={{ color: "white" }} /> : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AddressesPage() {
  const theme = useTheme();
  const router = useRouter();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);

  const { data, isLoading } = useGetAddressesQuery(undefined, {
    skip: !isAuthenticated,
  });
  const addresses = data?.data ?? [];

  const [deleteAddress, { isLoading: isDeleting }] = useDeleteAddressMutation();
  const [setDefaultAddress] = useSetDefaultAddressMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editAddress, setEditAddress] = useState<Address | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Address | null>(null);
  const [settingDefaultId, setSettingDefaultId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [snack, setSnack] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_KEY,
    libraries: MAP_LIBRARIES,
  });

  const showSnack = (msg: string) => setSnack({ open: true, msg });

  const handleEdit = (address: Address) => {
    setEditAddress(address);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditAddress(null);
    setDialogOpen(true);
  };

  const handleDeleteClick = (address: Address) => {
    setDeleteTarget(address);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await deleteAddress(deleteTarget.id).unwrap();
      showSnack("Address deleted");
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  };

  const handleSetDefault = async (address: Address) => {
    setSettingDefaultId(address.id);
    try {
      await setDefaultAddress(address.id).unwrap();
      showSnack(`"${address.label}" set as default`);
    } finally {
      setSettingDefaultId(null);
    }
  };

  if (!isLoaded) {
    return (
      <>
        <Navbar />
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <CircularProgress />
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        {/* ── Hero ── */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}12, ${theme.palette.background.accent})`,
            borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            py: { xs: 4, md: 6 },
          }}
        >
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: theme.palette.primary.main,
                    }}
                  >
                    <LocationOnOutlinedIcon />
                  </Box>
                  <Box>
                    <Typography
                      variant="h4"
                      sx={{ fontFamily: "var(--font-display)", fontWeight: 700, lineHeight: 1.1 }}
                    >
                      My Addresses
                    </Typography>
                    <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
                      {addresses.length === 0
                        ? "No saved addresses yet"
                        : `${addresses.length} saved address${addresses.length > 1 ? "es" : ""}`}
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                  Add New Address
                </Button>
              </Box>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
          {isLoading ? (
            <Grid container spacing={3}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} key={i}>
                  <Skeleton variant="rectangular" height={220} sx={{ borderRadius: 3 }} />
                </Grid>
              ))}
            </Grid>
          ) : addresses.length === 0 ? (
            // ── Empty state ──
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}>
              <Box sx={{ textAlign: "center", py: { xs: 8, md: 12 } }}>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mx: "auto",
                    mb: 3,
                  }}
                >
                  <LocationOnOutlinedIcon
                    sx={{ fontSize: "2.5rem", color: theme.palette.primary.main, opacity: 0.5 }}
                  />
                </Box>
                <Typography
                  variant="h5"
                  sx={{ fontFamily: "var(--font-display)", fontWeight: 600, mb: 1 }}
                >
                  No addresses saved
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: theme.palette.text.secondary, mb: 4, maxWidth: 340, mx: "auto" }}
                >
                  Add your first address to make checkout faster and easier.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  startIcon={<AddIcon />}
                  onClick={handleAdd}
                  sx={{ borderRadius: 3, px: 4, py: 1.5, textTransform: "none", fontWeight: 600 }}
                >
                  Add Your First Address
                </Button>
              </Box>
            </motion.div>
          ) : (
            <Grid container spacing={3}>
              <AnimatePresence mode="popLayout">
                {addresses.map((address) => (
                  <Grid item xs={12} sm={6} md={4} key={address.id}>
                    <AddressCard
                      address={address}
                      onEdit={() => handleEdit(address)}
                      onDelete={() => handleDeleteClick(address)}
                      onSetDefault={() => handleSetDefault(address)}
                      isSettingDefault={settingDefaultId === address.id}
                      isDeleting={deletingId === address.id}
                    />
                  </Grid>
                ))}
              </AnimatePresence>

              {/* Add more card */}
              <Grid item xs={12} sm={6} md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: addresses.length * 0.05 }}
                >
                  <Paper
                    elevation={0}
                    onClick={handleAdd}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: `1.5px dashed ${theme.palette.divider}`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1.5,
                      cursor: "pointer",
                      minHeight: 180,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: theme.palette.primary.main,
                        background: alpha(theme.palette.primary.main, 0.03),
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: theme.palette.primary.main,
                      }}
                    >
                      <AddIcon />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                    >
                      Add new address
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            </Grid>
          )}
        </Container>
      </main>

      <Footer />

      {/* ── Form dialog ── */}
      <AddressFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editAddress={editAddress}
        onSuccess={showSnack}
      />

      {/* ── Delete dialog ── */}
      <DeleteConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deletingId !== null}
      />

      {/* ── Snackbar ── */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ open: false, msg: "" })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ borderRadius: 2 }}>
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
}