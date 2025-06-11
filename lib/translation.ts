import { add, daysToWeeks } from "date-fns";
import { Card } from "../components/ui/card";
// import { DashboardTranslation } from '../app/types/translationTypes';

export const translations: TranslationDictionary = {
  en: {

    //!ui
    ui: {
      admin: {
        title: "Admin Dashboard",
        components: {
          alerts: "Alerts",
          organizations: "Organizations",
          messages: "Messages",
          maps: "Map",
          settings: "Settings",
          dashboard: "Dashboard",
          resources: "Resources",
          analytics: "Analytics",
        },
      },
      partner: {
        title: "Partner Dashboard",
        components: {
          dashboard: "Dashboard",
          alerts: "Alerts",
          resources: "Resources",
          personnel: "Personnel",
          map: "Map",
          messages: "Messages",
          organization: "Organization",
          sos: "SOS",
          settings: "Settings",
        },
      },
    },

    //!alert

    alert: {
      title: "Alert Management",
      button: "Create Alert",
      dialogTitle: "Create New Alert",
      // mediaUrls: "Media URLs (Images/Videos)",
      smsEnabled: {
        title: "SMS Enabled",
        yes: "Yes",
        no: "No",
      },
      ussdCode: "USSD Code",
      mediaUrls: "Media URLs (Images/Videos)",
      voiceTranscriptions: "Voice Transcriptions",
    },

    //!alertBadge
    alertBadge: {
      red: {
        label: "Extreme Danger",
      },
      orange: {
        label: "High Risk",
      },
      yellow: {
        label: "Moderate Risk",
      },
      green: {
        label: "Safe",
      },
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

    //!messages
    messages: {
      title: "Messages",
      button: "Send Message",
    },

    //!messageForm
    messageForm: {
      title: "Send a Message",
      type: {
        title: "Message Type",
        placeholder: "Select message type",
        options: {
          direct: "Direct",
          group: "Group",
          broadcast: "Broadcast",
          sms: "SMS",
          ussd: "USSD",
        },
      },
      recipientId: {
        title: "Recipient ID",
        placeholder: "Enter recipient ID (leave blank for broadcast)",
      },
      priority: {
        title: "Priority",
        placeholder: "Select priority",
        options: {
          normal: "Normal",
          urgent: "Urgent",
          emergency: "Emergency",
        },
      },
      deliveryMethod: {
        title: "Delivery Method",
        placeholder: "Select delivery method",
        options: {
          internet: "Internet",
          sms: "SMS",
          ussd: "USSD",
        },
      },
      content: {
        title: "Message Content",
        placeholder: "Type your message...",
      },
      submitButton: "Send Message",
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
      cardTitle: "Legend",
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
      latitude: "Latitude",
      longitude: "Longitude",
      submitButton: "Add Organization",
    },

    partnerPage:{
      components:{
        dashboard:{
          title: "Partner Dashboard",
          description: "Welcome to the Partner Dashboard",
          resourceCount: "Available Resources",
          personnelCount: "Active Personnel",
          organizationStatus: "Organization Status",
          allSystemsOperational: "All systems operational",
        },
        alerts:{
          title: "Active Alerts",
        },
        resources: {
          title: "Resource Management",
          addButton: "Add Resource",
          requestButton: "Request Resource",
          requestedResources: "Requested Resources",
          requestResourceForm: {
            title: "Request Resource",
            name: "Name",
            quantity: "Quantity",
            unit: "Unit",
            expiryDate: "Expiry Date",
            resourceType: {
              title: "Resource Type",
              options: {
                food: "Food",
                medicine: "Medicine",
                shelter: "Shelter",
                equipment: "Equipment",
              },
            },
            status: {
              title: "Status",
              options: {
                requested: "Requested",
                allocated: "Allocated",
                depleted: "Depleted",
              },
            },
            submitButton: "Request Resource",
            conditions: {
              title: "Conditions",
              placeholder: "Enter conditions separated by commas",
            },
            urgency: {
              title: "Urgency",
              options: {
                low: "Low",
                medium: "Medium",
                high: "High",
              },
            },
            disasterType: {
              title: "Disaster Type",
              options: {
                flood: "Flood",
                earthquake: "Earthquake",
                fire: "Fire",
                other: "Other",
              },
            },
          },
          addResourceForm: {
            title: "Add New Resource",
            name: "Name",
            type: {
              title: "Type",
              options: {
                food: "Food",
                medicine: "Medicine",
                shelter: "Shelter",
                equipment: "Equipment",
              },
            },
            quantity: "Quantity",
            unit: "Unit",
            expiryDate: "Expiry Date",
            status: {
              title: "Status",
              options: {
                available: "Available",
                allocated: "Allocated",
                depleted: "Depleted",
              },
            },
            conditions: {
              title: "Conditions",
              placeholder: "Enter conditions separated by commas",
            },
            submitButton: "Add Resource",
          },
        },
      },
    }
  },
  hi: {

    //!ui
    ui: {
      admin: {
        title: "व्यवस्थापक डैशबोर्ड",
        components: {
          alerts: "अलर्ट",
          organizations: "संगठन",
          messages: "संदेश",
          maps: "मानचित्र",
          settings: "सेटिंग्स",
          dashboard: "डैशबोर्ड",
          resources: "संसाधन",
          analytics: "विश्लेषण",
        },
      },
      partner: {
        title: "साझेदार डैशबोर्ड",
        components: {
          dashboard: "डैशबोर्ड",
          alerts: "अलर्ट",
          resources: "संसाधन",
          personnel: "कर्मचारी",
          map: "मानचित्र",
          messages: "संदेश",
          organization: "संगठन",
          sos: "एसओएस",
          settings: "सेटिंग्स",
        },
      },
    },


    //!alertBadge
    alertBadge: {
      red: {
        label: "अत्यधिक खतरा",
      },
      orange: {
        label: "उच्च जोखिम",
      },
      yellow: {
        label: "मध्यम जोखिम",
      },
      green: {
        label: "सुरक्षित",
      },
    },

    alert: {
      title: "अलर्ट प्रबंधन",
      button: "अलर्ट बनाएं",
      dialogTitle: "नया अलर्ट बनाएं",
      // mediaUrls: "मीडिया यूआरएल (छवियाँ/वीडियो)",
      smsEnabled: {
        title: "एसएमएस सक्षम करें",
        yes: "हाँ",
        no: "नहीं",
      },
      ussdCode: "यूएसएसडी कोड",
      mediaUrls: "मीडिया यूआरएल (छवियाँ/वीडियो)",
      voiceTranscriptions: "वॉयस ट्रांसक्रिप्शन",
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
      latitude: "अक्षांश",
      longitude: "देशांतर",
      submitButton: "संगठन जोड़ें",
    },

    messages: {
      title: "संदेश",
      button: "संदेश भेजें",
    },

    messageForm: {
      title: "संदेश भेजें",
      type: {
        title: "संदेश प्रकार",
        placeholder: "संदेश प्रकार चुनें",
        options: {
          direct: "प्रत्यक्ष",
          group: "समूह",
          broadcast: "प्रसारण",
          sms: "एसएमएस",
          ussd: "यूएसएसडी",
        },
      },
      recipientId: {
        title: "प्राप्तकर्ता आईडी",
        placeholder: "प्राप्तकर्ता आईडी दर्ज करें (प्रसारण के लिए खाली छोड़ें)",
      },
      priority: {
        title: "प्राथमिकता",
        placeholder: "प्राथमिकता चुनें",
        options: {
          normal: "सामान्य",
          urgent: "तत्काल",
          emergency: "आपातकालीन",
        },
      },
      deliveryMethod: {
        title: "डिलीवरी विधि",
        placeholder: "डिलीवरी विधि चुनें",
        options: {
          internet: "इंटरनेट",
          sms: "एसएमएस",
          ussd: "यूएसएसडी",
        },
      },
      content: {
        title: "संदेश सामग्री",
        placeholder: "अपना संदेश टाइप करें...",
      },
      submitButton: "संदेश भेजें",
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
      cardTitle: "विधि",
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

    partnerPage: {
      components: {
        dashboard: {
          title: "साझेदार डैशबोर्ड",
          description: "साझेदार डैशबोर्ड में आपका स्वागत है",
          resourceCount: "उपलब्ध संसाधन",
          personnelCount: "सक्रिय कर्मचारी",
          organizationStatus: "संगठन की स्थिति",
          allSystemsOperational: "सभी सिस्टम संचालित हैं",
        },
        alerts: {
          title: "सक्रिय अलर्ट",
        },
        resources: {
          title: "संसाधन प्रबंधन",
          addButton: "संसाधन जोड़ें",
          requestButton: "संसाधन अनुरोध करें",
          requestedResources: "अनुरोधित संसाधन",
          requestResourceForm: {
            title: "संसाधन अनुरोध करें",
            name: "नाम",
            quantity: "मात्रा",
            unit: "इकाई",
            expiryDate: "समाप्ति तिथि",
            resourceType: {
              title: "संसाधन प्रकार",
              options: {
                food: "भोजन",
                medicine: "दवा",
                shelter: "आश्रय",
                equipment: "उपकरण",
              },
            },
            status: {
              title: "स्थिति",
              options: {
                requested: "अनुरोधित",
                allocated: "आवंटित",
                depleted: "खत्म हो गया",
              },
            },
            submitButton: "संसाधन अनुरोध करें",
            conditions: {
              title: "शर्तें",
              placeholder: "अल्पविराम से अलग करके शर्तें दर्ज करें",
            },
            urgency: {
              title: "तत्कालता",
              options: {
                low: "कम",
                medium: "मध्यम",
                high: "उच्च",
              },
            },
            disasterType: {
              title: "आपदा प्रकार",
              options: {
                flood: "बाढ़",
                earthquake: "भूकंप",
                fire: "आग",
                other: "अन्य",
              },
            },
          },
          addResourceForm: {
            title: "नया संसाधन जोड़ें",
            name: "नाम",
            type: {
              title: "प्रकार",
              options: {
                food: "भोजन",
                medicine: "दवा",
                shelter: "आश्रय",
                equipment: "उपकरण",
              },
            },
            quantity: "मात्रा",
            unit: "इकाई",
            expiryDate: "समाप्ति तिथि",
            status: {
              title: "स्थिति",
              options: {
                available: "उपलब्ध",
                allocated: "आवंटित",
                depleted: "खत्म हो गया",
              },
            },
            conditions: {
              title: "शर्तें",
              placeholder: "अल्पविराम से अलग करके शर्तें दर्ज करें",
            },
            submitButton: "संसाधन जोड़ें",
          },
        },
      },
    },

  },
};
