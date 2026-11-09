// constants/contact.ts

/**
 * Single source of truth for Angels in My Kitchen customer contact details,
 * official addresses, call center support, and WhatsApp communication channels.
 */
export const CONTACT_INFO = {
  address: "A-65, Sector 64, Noida, Uttar Pradesh 201301",
  email: "callcenter@nirulas.com",
  emailHref: "mailto:callcenter@nirulas.com",
  tollFree: "1800 102 5247",
  tollFreeHref: "tel:18001025247",
  mobile: "+91 84448 49940",
  mobileHref: "tel:+918444849940",
  whatsappNumber: "919250010686",
  whatsappDisplay: "+91 92500 10686",

  /**
   * Generates a deep-link WhatsApp URL with pre-filled message text.
   */
  getWhatsappUrl: (text?: string) => {
    const defaultText = "Hello Angels in My Kitchen team, I have a question!";
    return `https://wa.me/919250010686?text=${encodeURIComponent(text || defaultText)}`;
  },
};
