// import { DashboardTranslation } from '../app/types/translationTypes';

export const translations: TranslationDictionary = {
  en: {
    //!alert

    alert: {
      title: "Alert Management",
      button: "Create Alert",
      dialogTitle: "Create New Alert",
    },

    //! alertform

    alertForm: {
      label: "Severity",
      severity: {
        placeholder: "Select Severity",
        options: {
          red: "Red (Critical)",
          orange: "Orange (High)",
          yellow: "Yellow (Medium)",
          green: "Green (Low)",
        },
      },
      alertTitle: {
        title: "Alert Title",
        placeholder: "Enter alert title",
      },
      alertDescription: {
        title: "Alert Description",
        placeholder: "Enter alert description",
      },
      location: {
        title: "Location",
        placeholder: "Enter location details",
      },
      population: {
        title: "Population Affected",
        placeholder: "Enter affected population count",
      },
      mediaUrls: {
        title: "Media URLs",
        placeholder: "Enter media URLs (images/videos)",
      },
      enableSMS: {
        title: "Enable SMS Notifications",
        placeholder: "Do you want to enable SMS notifications?",
        yes: "Yes",
        no: "No",
      },
      ussdCode: {
        title: "USSD Code for Alerts",
        placeholder: "(e.g., *123#)",
      },

      submitButton: "Create Alert",
    },

    // !dashboard

    dashboard: {
      title: "Dashboard Overview",
      cards: {
        activeAlerts: "Active Alerts",
        activeOrganizations: "Active Organizations",
        organizationInfo: "Across 6 categories",
        fieldPersonnel: "Field Personnel",
        personnelInfo: "Currently deployed",
        systemStatus: "System Status",
        systemOperational: "Operational",
        allSystemsNormal: "All systems normal",
      },
      floodPrediction: "Flood Prediction (India)",
      resourceAnalysis: "Resource Allocation Analysis",
      optimizedRecommendation: "Optimized Resource Recommendation",
    },
    // !maps
    maps: {
      title: "Maps",
      description: "Personnel and SOS location",
      legends: {
        personnel: "Personnel",
        sosAlerts: "SOS Alerts",
        organizations: "Organizations",
        resources: "Resources",
      },
    },
    // !settings
    settings: {
      title: "Settings",
      tabs: {
        account: "Account",
        language: "Language",
        security: "Security",
        accessibility: "Accessibility",
        communications: "Communications",
      },
      accountSettings: {
        title: "Account Settings",
        description: "Manage your account information",
        emailLabel: "Email Address",
        saveButton: "Save Changes",
        loading: "Loading account details...",
        userNotFound: "User not found",
      },
      languageSettings: {
        title: "Language Preferences",
        description: "Choose your preferred language",
        languageLabel: "Language",
      },
      accessibilitySettings: {
        title: "Accessibility",
        description: "Customize accessibility features",
        highContrastLabel: "High Contrast Mode",
        reduceMotionLabel: "Reduce Motion",
        screenReaderLabel: "Screen Reader Support",
        saveButton: "Save Settings",
      },
      communicationSettings: {
        title: "Communications",
        description: "Manage your notification preferences",
        newslettersLabel: "Newsletters",
        productUpdatesLabel: "Product Updates",
        feedbackRequestsLabel: "Feedback Requests",
        saveButton: "Save Preferences",
      },
    },

    // !organizations
    organizations: {
      title: " Organizations",
      button: "Add Organization",
      dialogTitle: "Add New Organization",
    },

    //!organizationForm
    organizationForm: {
      orgName: "Name",
      orgTypes: {
        title: "Type",
        placeholder: "Select type",
        options: {
          healthcare: "Healthcare",
          ngo: "NGO",
          essentials: "Essential",
          infrastructure: "Infrastructure",
          community: "Community",
          private: "Private",
          specialized: "Specialized",
        },
      },
      orgCapabilities: {
        title: "Capabilities",
        placeholder: "Enter capabilities separated by commas",
      },
      contactEmail: {
        title: "Contact Email",
        // placeholder:"Enter contact email",
      },
      contactPhone: {
        title: "Contact Phone",
        // placeholder:"Enter contact phone",
      },
      address: {
        title: "Address",
        // placeholder:"Enter address",
      },
      submitButton: "Add Organization",
    },
  },
  hi: {
    alert: {
      title: "अलर्ट प्रबंधन",
      button: "अलर्ट बनाएं",
      dialogTitle: "नया अलर्ट बनाएं",
    },

    alertForm: {
      label: "गंभीरता",
      severity: {
        placeholder: "गंभीरता चुनें",
        options: {
          red: "लाल (गंभीर)",
          orange: "नारंगी (उच्च)",
          yellow: "पीला (मध्यम)",
          green: "हरा (कम)",
        },
      },
      alertTitle: {
        title: "अलर्ट शीर्षक",
        placeholder: "अलर्ट शीर्षक दर्ज करें",
      },
      alertDescription: {
        title: "अलर्ट विवरण",
        placeholder: "अलर्ट विवरण दर्ज करें",
      },
      location: {
        title: "स्थान",
        placeholder: "स्थान विवरण दर्ज करें",
      },
      population: {
        title: "प्रभावित जनसंख्या",
        placeholder: "प्रभावित जनसंख्या संख्या दर्ज करें",
      },
      mediaUrls: {
        title: "मीडिया यूआरएल",
        placeholder: "मीडिया यूआरएल (छवियाँ/वीडियो) दर्ज करें",
      },
      enableSMS: {
        title: "एसएमएस सूचनाएं सक्षम करें",
        placeholder: "क्या आप एसएमएस सूचनाएं सक्षम करना चाहते हैं?",
        yes: "हाँ",
        no: "नहीं",
      },
      ussdCode: {
        title: "अलर्ट के लिए यूएसएसडी कोड",
        placeholder: "(जैसे, *123#)",
      },
      submitButton: "अलर्ट बनाएं",
    },

    organizations: {
      title: "संगठन",
      button: "संगठन जोड़ें",
      dialogTitle: "नया संगठन जोड़ें",
    },

    organizationForm: {
      orgName: "नाम",
      orgTypes: {
        title: "प्रकार",
        placeholder: "प्रकार चुनें",
        options: {
          healthcare: "स्वास्थ्य सेवा",
          ngo: "एनजीओ",
          essentials: "आवश्यकताएँ",
          infrastructure: "इन्फ्रास्ट्रक्चर",
          community: "समुदाय",
          private: "निजी",
          specialized: "विशेषीकृत",
        },
      },
      orgCapabilities: {
        title: "क्षमताएँ",
        placeholder: "क्षमताएँ दर्ज करें, अल्पविराम से अलग करें",
      },
      contactEmail: {
        title: "संपर्क ईमेल",
        // placeholder:"संपर्क ईमेल दर्ज करें",
      },
      contactPhone: {
        title: "संपर्क फोन",
        // placeholder:"संपर्क फोन दर्ज करें",
      },
      address: {
        title: "पता",
        // placeholder:"पता दर्ज करें",
      },
      submitButton: "संगठन जोड़ें",
    },

    maps: {
      title: "मानचित्र",
      description: "कर्मचारी और एसओएस स्थान",
      legends: {
        personnel: "कर्मचारी",
        sosAlerts: "एसओएस अलर्ट",
        organizations: "संगठन",
        resources: "संसाधन",
      },
    },
    settings: {
      title: "सेटिंग्स",
      tabs: {
        account: "खाता",
        language: "भाषा",
        security: "सुरक्षा",
        accessibility: "पहुँच योग्यता",
        communications: "संचार",
      },
      accountSettings: {
        title: "खाता सेटिंग्स",
        description: "अपने खाते की जानकारी प्रबंधित करें",
        emailLabel: "ईमेल पता",
        saveButton: "परिवर्तन सहेजें",

        loading: "खाता विवरण लोड हो रहा है...",
        userNotFound: "उपयोगकर्ता नहीं मिला",
      },
      languageSettings: {
        title: "भाषा प्राथमिकताएं",
        description: "अपनी पसंदीदा भाषा चुनें",
        languageLabel: "भाषा",
      },
      accessibilitySettings: {
        title: "पहुँच योग्यता",
        description: "पहुँच सुविधाओं को अनुकूलित करें",
        highContrastLabel: "उच्च कंट्रास्ट मोड",
        reduceMotionLabel: "गतिविधि कम करें",
        screenReaderLabel: "स्क्रीन रीडर समर्थन",
        saveButton: "सेटिंग्स सहेजें",
      },
      communicationSettings: {
        title: "संचार",
        description: "अपनी सूचना प्राथमिकताएं प्रबंधित करें",
        newslettersLabel: "न्यूज़लेटर",
        productUpdatesLabel: "उत्पाद अपडेट्स",
        feedbackRequestsLabel: "प्रतिक्रिया अनुरोध",
        saveButton: "प्राथमिकताएँ सहेजें",
      },
    },

    dashboard: {
      title: "डैशबोर्ड अवलोकन",
      cards: {
        activeAlerts: "सक्रिय अलर्ट",
        activeOrganizations: "सक्रिय संगठन",
        organizationInfo: "6 श्रेणियों में",
        fieldPersonnel: "मैदान में कार्यरत कर्मचारी",
        personnelInfo: "वर्तमान में तैनात",
        systemStatus: "सिस्टम की स्थिति",
        systemOperational: "संचालित",
        allSystemsNormal: "सभी सिस्टम सामान्य हैं",
      },
      floodPrediction: "बाढ़ पूर्वानुमान (भारत)",
      resourceAnalysis: "संसाधन आवंटन विश्लेषण",
      optimizedRecommendation: "अनुकूलित संसाधन सिफारिश",
    },

    //!organizationForm
  },
};
