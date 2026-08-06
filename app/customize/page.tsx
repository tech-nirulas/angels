"use client";

import { useGetCustomizationFormQuery } from "@/features/cake-customization/cakeCustomizationApiService";
import { useCreateCakeRequestMutation } from "@/features/cake-customization/cakeApiService";
import { MEDIA_BASE_URL } from "@/utils/constants";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CakeOutlinedIcon from "@mui/icons-material/CakeOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Popular Cake Flavors for quick chip selection
const FLAVOR_OPTIONS = [
  "Belgian Dark Chocolate",
  "Red Velvet Velvet",
  "Classic Vanilla Bean",
  "Fresh Alphonso Mango",
  "Strawberry Cream",
  "Butterscotch Crunch",
  "Black Forest",
  "Hazelnut Nutella",
  "Blueberry Cheesecake",
  "Pineapple Delight",
  "Custom / Special Request",
];

const OCCASIONS = [
  "Birthday Party",
  "Wedding Ceremony",
  "Anniversary",
  "Corporate Event",
  "Baby Shower",
  "Graduation",
  "Festival / Celebration",
  "Other",
];

const CAKE_SIZES = [
  { value: "SMALL", label: "Small (~500g)", desc: "Serves 4–6 people" },
  { value: "MEDIUM", label: "Medium (~1kg)", desc: "Serves 10–12 people" },
  { value: "LARGE", label: "Large (~2kg)", desc: "Serves 20–25 people" },
  { value: "CUSTOM", label: "Custom Tiered", desc: "Special multi-tier design" },
];

export default function CustomizeCakePage() {
  const theme = useTheme();
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    occasion: "Birthday Party",
    size: "MEDIUM" as "SMALL" | "MEDIUM" | "LARGE" | "CUSTOM",
    flavors: [] as string[],
    designNotes: "",
    preferredDeliveryDate: "",
    deliveryAddress: "",
    city: "Delhi NCR",
    pincode: "",
    contactPreference: "WHATSAPP" as "WHATSAPP" | "EMAIL" | "CALL",
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [uploadedImageKeys, setUploadedImageKeys] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Submission State
  const [createCakeRequest, { isLoading, error }] = useCreateCakeRequestMutation();
  const [submittedResult, setSubmittedResult] = useState<any>(null);

  // Handle Flavor Toggle
  const handleFlavorToggle = (flavor: string) => {
    setFormData((prev) => ({
      ...prev,
      flavors: prev.flavors.includes(flavor)
        ? prev.flavors.filter((f) => f !== flavor)
        : [...prev.flavors, flavor],
    }));
  };

  // Handle Image Select & Upload to backend Media API
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);

    setUploadingImages(true);
    const newKeys: string[] = [];

    for (const file of files) {
      try {
        const uploadData = new FormData();
        uploadData.append("file", file);
        uploadData.append("folder", "cake-customizations");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:9090"}/media/upload`,
          {
            method: "POST",
            body: uploadData,
          }
        );
        const json = await response.json();
        if (json.status && json.data?.key) {
          newKeys.push(json.data.key);
        }
      } catch (err) {
        console.error("Failed to upload image:", err);
      }
    }

    setUploadedImageKeys((prev) => [...prev, ...newKeys]);
    setUploadingImages(false);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || undefined,
        occasion: formData.occasion,
        size: formData.size,
        flavors: formData.flavors,
        designNotes: formData.designNotes || undefined,
        preferredDeliveryDate: formData.preferredDeliveryDate || undefined,
        deliveryAddress: formData.deliveryAddress || undefined,
        city: formData.city || undefined,
        pincode: formData.pincode || undefined,
        contactPreference: formData.contactPreference,
        referenceImageKeys: uploadedImageKeys,
      };

      const res = await createCakeRequest(payload).unwrap();
      const resultData = res.data || res;
      setSubmittedResult(resultData);

      // If WhatsApp contact preference selected, open WhatsApp chat automatically
      if (formData.contactPreference === "WHATSAPP") {
        const waText = encodeURIComponent(
          `*Custom Cake Request* 🎂\n\n` +
            `*Ref No:* ${resultData.refNumber}\n` +
            `*Name:* ${formData.name}\n` +
            `*Phone:* ${formData.phone}\n` +
            `*Occasion:* ${formData.occasion}\n` +
            `*Size:* ${formData.size}\n` +
            `*Flavors:* ${formData.flavors.join(", ") || "Standard"}\n` +
            `*Delivery Date:* ${formData.preferredDeliveryDate || "Flexible"}\n` +
            `*City:* ${formData.city}\n` +
            `*Notes:* ${formData.designNotes || "None"}\n\n` +
            `Hello Angels in My Kitchen team, I would like to discuss my custom cake request!`
        );

        const whatsappNumber = "919478370346"; // Official WhatsApp contact number
        window.open(`https://wa.me/${whatsappNumber}?text=${waText}`, "_blank");
      }
    } catch (err) {
      console.error("Error submitting custom cake request:", err);
    }
  };

  return (
    <main style={{ backgroundColor: "#FAF7F5", minHeight: "100vh", paddingBottom: "80px" }}>
        {/* Header Hero Banner */}
        <Box
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15, ${theme.palette.background.accent})`,
            color: "#FFF",
            py: { xs: 5, md: 8 },
            px: 2,
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Container maxWidth="md">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Chip
                icon={<CakeOutlinedIcon sx={{ color: "#FBBF24 !important" }} />}
                label="Customized Bakes"
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  color: "#FBBF24",
                  fontWeight: 700,
                  mb: 2,
                  backdropFilter: "blur(4px)",
                }}
              />
              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "3.2rem" },
                  mb: 1.5,
                }}
              >
                Design Your Dream Cake
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, maxWidth: 600, mx: "auto", fontSize: "1.1rem" }}>
                Tell us your vision, flavor preferences, and occasion. Upload inspiration images or connect directly with our master bakers on WhatsApp.
              </Typography>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ mt: 4 }}>
          {submittedResult ? (
            /* Success Confirmation State */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 3, md: 5 },
                  borderRadius: 4,
                  textAlign: "center",
                  bgcolor: "#FFF",
                  border: `2px solid ${theme.palette.success.main}`,
                }}
              >
                <CheckCircleOutlinedIcon sx={{ fontSize: 72, color: theme.palette.success.main, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 800, color: "#2B1810", mb: 1 }}>
                  Request Received!
                </Typography>
                <Typography variant="subtitle1" sx={{ color: theme.palette.text.secondary, mb: 3 }}>
                  Your Custom Cake Request Reference Number:
                </Typography>

                <Box
                  sx={{
                    display: "inline-block",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    border: `1.5px dashed ${theme.palette.primary.main}`,
                    px: 4,
                    py: 1.5,
                    borderRadius: 3,
                    mb: 4,
                  }}
                >
                  <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 2, color: theme.palette.primary.main }}>
                    {submittedResult.refNumber}
                  </Typography>
                </Box>

                <Typography variant="body1" sx={{ mb: 4, color: "#4A3B32" }}>
                  Thank you, <strong>{submittedResult.name}</strong>. Our baking team is reviewing your customization request for {submittedResult.occasion}. We will get back to you shortly via <strong>{submittedResult.contactPreference}</strong>.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<WhatsAppIcon />}
                    sx={{
                      bgcolor: "#25D366",
                      "&:hover": { bgcolor: "#1EBE57" },
                      fontWeight: 700,
                      px: 3,
                    }}
                    onClick={() => {
                      const waText = encodeURIComponent(
                        `Hi Angels in My Kitchen, checking status for Custom Cake Ref: ${submittedResult.refNumber}`
                      );
                      window.open(`https://wa.me/919478370346?text=${waText}`, "_blank");
                    }}
                  >
                    Chat on WhatsApp Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      setSubmittedResult(null);
                      setFormData((prev) => ({ ...prev, designNotes: "", flavors: [] }));
                    }}
                  >
                    Submit Another Request
                  </Button>
                </Box>
              </Paper>
            </motion.div>
          ) : (
            /* Main Form */
            <Paper
              elevation={2}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                bgcolor: "#FFF",
                boxShadow: "0 10px 40px rgba(0,0,0,0.06)",
              }}
            >
              <form onSubmit={handleSubmit}>
                {error && (
                  <Alert severity="error" sx={{ mb: 4 }}>
                    Unable to submit customization request. Please check your inputs or try again.
                  </Alert>
                )}

                {/* Section 1: Customer Contact Details */}
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#2B1810", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonOutlinedIcon color="primary" /> 1. Contact & Delivery Info
                </Typography>

                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Your Name *"
                      fullWidth
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Phone Number (WhatsApp) *"
                      fullWidth
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Email Address (Optional)"
                      fullWidth
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="City *"
                      fullWidth
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 8 }}>
                    <TextField
                      label="Delivery Street Address"
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Flat, House no., Building, Street, Area"
                      value={formData.deliveryAddress}
                      onChange={(e) => setFormData({ ...formData, deliveryAddress: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <TextField
                      label="Pincode"
                      fullWidth
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Section 2: Cake Specifications */}
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#2B1810", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <CakeOutlinedIcon color="primary" /> 2. Cake Customization
                </Typography>

                <Grid container spacing={2.5} sx={{ mb: 4 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      Occasion *
                    </Typography>
                    <Select
                      fullWidth
                      value={formData.occasion}
                      onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                    >
                      {OCCASIONS.map((occ) => (
                        <MenuItem key={occ} value={occ}>
                          {occ}
                        </MenuItem>
                      ))}
                    </Select>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      Preferred Delivery / Pickup Date
                    </Typography>
                    <TextField
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      value={formData.preferredDeliveryDate}
                      onChange={(e) => setFormData({ ...formData, preferredDeliveryDate: e.target.value })}
                    />
                  </Grid>

                  {/* Cake Size Selection Cards */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1.5 }}>
                      Select Size / Weight *
                    </Typography>
                    <Grid container spacing={2}>
                      {CAKE_SIZES.map((sz) => {
                        const selected = formData.size === sz.value;
                        return (
                          <Grid size={{ xs: 6, sm: 3 }} key={sz.value}>
                            <Card
                              onClick={() => setFormData({ ...formData, size: sz.value as any })}
                              sx={{
                                cursor: "pointer",
                                border: `2px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
                                bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : "#FFF",
                                borderRadius: 3,
                                transition: "all 0.2s ease",
                                textAlign: "center",
                                py: 2,
                                px: 1,
                                "&:hover": {
                                  borderColor: theme.palette.primary.main,
                                },
                              }}
                            >
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: selected ? theme.palette.primary.main : "#2B1810" }}>
                                {sz.label}
                              </Typography>
                              <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                                {sz.desc}
                              </Typography>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>

                  {/* Flavor Chips */}
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      Select Preferred Flavors
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {FLAVOR_OPTIONS.map((flavor) => {
                        const isSelected = formData.flavors.includes(flavor);
                        return (
                          <Chip
                            key={flavor}
                            label={flavor}
                            clickable
                            color={isSelected ? "primary" : "default"}
                            variant={isSelected ? "filled" : "outlined"}
                            onClick={() => handleFlavorToggle(flavor)}
                            sx={{ fontWeight: isSelected ? 700 : 500 }}
                          />
                        );
                      })}
                    </Box>
                  </Grid>

                  {/* Design & Message Notes */}
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      label="Custom Design Notes & Cake Message *"
                      fullWidth
                      required
                      multiline
                      rows={4}
                      placeholder="e.g. Write 'Happy 30th Birthday Rahul!' in gold font. Theme: Tropical jungle with fondant animal figures."
                      value={formData.designNotes}
                      onChange={(e) => setFormData({ ...formData, designNotes: e.target.value })}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                      Preferred Response Channel *
                    </Typography>
                    <Select
                      fullWidth
                      value={formData.contactPreference}
                      onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value as any })}
                    >
                      <MenuItem value="WHATSAPP">WhatsApp Message (Fastest)</MenuItem>
                      <MenuItem value="EMAIL">Email</MenuItem>
                      <MenuItem value="CALL">Phone Call</MenuItem>
                    </Select>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* Section 3: Reference Image Upload */}
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#2B1810", mb: 2, display: "flex", alignItems: "center", gap: 1 }}>
                  <CloudUploadOutlinedIcon color="primary" /> 3. Sample / Inspiration Images (Optional)
                </Typography>

                <Box
                  sx={{
                    border: `2px dashed ${theme.palette.divider}`,
                    borderRadius: 3,
                    p: 4,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.02),
                    mb: 4,
                  }}
                >
                  <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                  <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
                    Upload Cake Design Photo / Sketches
                  </Typography>
                  <Typography variant="caption" sx={{ display: "block", color: theme.palette.text.secondary, mb: 2 }}>
                    Upload up to 5 images (PNG, JPG, WEBP)
                  </Typography>
                  <Button variant="outlined" component="label" disabled={uploadingImages}>
                    {uploadingImages ? <CircularProgress size={20} /> : "Choose Files"}
                    <input type="file" multiple accept="image/*" hidden onChange={handleImageSelect} />
                  </Button>

                  {selectedImages.length > 0 && (
                    <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
                      {selectedImages.map((file, idx) => (
                        <Chip key={idx} label={file.name} size="small" onDelete={() => {
                          setSelectedImages(prev => prev.filter((_, i) => i !== idx));
                          setUploadedImageKeys(prev => prev.filter((_, i) => i !== idx));
                        }} />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Submit Action */}
                <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                  <Button variant="outlined" size="large" onClick={() => router.push("/menu")}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={isLoading || uploadingImages}
                    startIcon={formData.contactPreference === "WHATSAPP" ? <WhatsAppIcon /> : <CakeOutlinedIcon />}
                    sx={{
                      bgcolor: formData.contactPreference === "WHATSAPP" ? "#25D366" : theme.palette.primary.main,
                      "&:hover": {
                        bgcolor: formData.contactPreference === "WHATSAPP" ? "#1EBE57" : theme.palette.primary.dark,
                      },
                      px: 4,
                      fontWeight: 800,
                    }}
                  >
                    {isLoading ? "Submitting..." : formData.contactPreference === "WHATSAPP" ? "Submit & Chat on WhatsApp" : "Submit Request"}
                  </Button>
                </Box>
              </form>
            </Paper>
          )}
        </Container>
      </main>
  );
}
