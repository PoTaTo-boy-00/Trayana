import { TranslationDictionary } from "@/app/types/translationTypes";
import { add, daysToWeeks } from "date-fns";
import { Card } from "../components/ui/card";
// import { DashboardTranslation } from '../app/types/translationTypes';

export const translations: TranslationDictionary = {
  en: {
    disaster: {
      title: "AI-Powered Disaster Prediction System",
      desc: "Advanced AI predictions using Google Gemini for accurate disaster risk assessment.",
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
      msgType: {
        broadcast: "Broadcast Message",
        direct: "Direct Message",
        group: "Group Message",
      },
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
      desc1: " Personnel and SOS locations",
      description: "Organization and Resources location",
      legends: {
        personnel: "Personnel",
        sosAlerts: "SOS Alerts",
        organizations: "Organizations",
        resources: "Resources",
      },
      // title:"LEGEND",
      cardTitle: "LEGEND",
      Available_Resources: "Available Resources",
      Resource_Requests: "Requested Resources",
      Map_Style: "Map Style",
      Roadmap: "Roadmap",
      Satellite: "Satellite",
      Hybrid: "Hybrid",
      Terrain: "Terrain",
      Enable_Clustering: "Enable Clustering",
      Statistics: "Statistics",
      Organizations: "Organizations",
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
      delete: "Delete",
      dialogTitle: "Add New Organization",
      Type: "Type", // "Prakaar"
      Capabilities: "Capabilities", // "Kshamataayen"
    },

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
    resources: {
      title: "Resource Management",
      filter: "Filter",

      btnName: "Add Resource",

      formTitle: "Add New Resource",
    },
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
    resourceForm: {
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
      location: "Location (Auto-detect)",
      detect_location: "Detect Location",
      locStatement: "No address detected yet.",
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

    partnerPage: {
      components: {
        dashboard: {
          title: "Partner Dashboard",
          description: "Welcome to the Partner Dashboard",
          resourceCount: "Available Resources",
          personnelCount: "Active Personnel",
          organizationStatus: "Organization Status",
          allSystemsOperational: "All systems operational",
        },
        alerts: {
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
        personnel: {
          title: "Personnel Management",
          addButton: "Add Personnel",
          loading: "Loading personnel data...",
        },
        messages: {
          title: "Messages",
          newButton: "New Message",
        },
        organization: {
          title: "Organization Profile",
          button: "Edit Profile",
          loading: "Loading organization data...",
        },
        sos: {
          title: "SOS Reports",
          header: "SOS Report",
          location: "Location",
          help: "Dispatch Help",
          coordinates: "Coordinates",
          time: "Reported at",
        },
      },
    },
    allocateResourceForm: {
      Allocate_Resource: "AllocateResource",
      Request_for: "Request for",
      Allocate_Quantity: "Allocate Quantity",
      Available: "Available",
      alert: "Invalid allocation amount.",
      Confirm_Allocation: "Confirm Allocation",
    },
    ResourcesCard: {
      type: "Type",
      quantity: "Quantity",
      location: "Location",
      status: "Status",
      conditions: "Conditions",
      expiryDate: "Expiry Date",
      requestedBy: "Requested By",
      allocateResources: "Allocate Resources",
    },
    analytics: {
      title: "Resource Analytics Dashboard",
      lastUpadte: "  Last Update",
      loading: "Performing advanced analytics...",
      Timeline: "24-Hour Resource Prediction Timeline",
      noPredicitonTimeline: "No prediction timeline available",
      prority: " Location Priority Scores (Real-time Updated)",
      nullPrority: "No priority data available",
      gapAnalysis: {
        title: " Advanced Resource Gap Analysis",
        missingTypes: "Missing Types",
        need: "Need",
        null: "No missing resources",
      },
      immediate: {
        title: "Immediate Needs",
        null: "No immediate needs",
      },
      surplous: {
        title: "Surplus Resources",
        extra: "Extra",
        location: "Location",
        null: "No surplus resources",
      },
      emergingNeeds: {
        title: "Emerging Needs",
        predicted: "Predicted",
        confidence: "Confidence",
        null: "No emerging needs predicted",
      },
      depletion: {
        title: "Advanced Depletion Predictions",
        Resource: "Resource",
        Name: "Name",
        Current: "Current",
        Depletion_Time: "Depletion Time",
        Probability: "Probability",
        Trend: "Trend",
        Velocity: "Velocity",
        Confidence: "Confidence",
        null: "No depletion predictions available",
      },
      history: {
        title: "Resource History Overview",
        total: " Total History Records",
        active: "Active Resources",
        pending: "Pending Requests",
      },
    },
  },
  hi: {
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

    disaster: {
      title: "एआई-सक्षम आपदा पूर्वानुमान प्रणाली",
      desc: "सटीक आपदा जोखिम मूल्यांकन के लिए Google Gemini का उपयोग करके उन्नत एआई पूर्वानुमान।",
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
      delete: "हटाएं",
      dialogTitle: "नया संगठन जोड़ें",
      Type: "प्रकार",
      Capabilities: "क्षमताएँ", // "Kshamataayen"
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
      msgType: {
        broadcast: "प्रसारण संदेश",
        direct: "प्रत्यक्ष संदेश",
        group: "समूह संदेश",
      },
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
      desc1: "कर्मचारी और एसओएस स्थान",
      description: "कर्मचारी और एसओएस स्थान",
      legends: {
        personnel: "कर्मचारी",
        sosAlerts: "एसओएस अलर्ट",
        organizations: "संगठन",
        resources: "संसाधन",
      },
      // cardTitle: "विधि",
      cardTitle: "प्रतीक चिन्ह",
      Available_Resources: "उपलब्ध संसाधन",
      Resource_Requests: "अनुरोधित संसाधन",
      Map_Style: "नक्शे की शैली",
      Roadmap: "सड़क नक्शा",
      Satellite: "उपग्रह दृश्य",
      Hybrid: "संयोजन दृश्य",
      Terrain: "भौगोलिक नक्शा",
      Enable_Clustering: "समूह सक्षम करें",
      Statistics: "आँकड़े",
      Organizations: "संगठन",
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
    resources: {
      title: "संसाधन प्रबंधन",
      filter: "फ़िल्टर",

      btnName: "संसाधन जोड़ें",

      formTitle: "नया संसाधन जोड़ें",
    },
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
    resourceForm: {
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
      location: "स्थान (स्वतः पता लगाएं)",
      detect_location: "स्थान का पता लगाएं",
      locStatement: "अभी तक कोई पता नहीं मिला है।",
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

    ResourcesCard: {
      type: "प्रकार",
      quantity: "मात्रा",
      location: "स्थान",
      status: "स्थिति",
      conditions: "शर्तें",
      expiryDate: "समाप्ति तिथि",
      requestedBy: "अनुरोधकर्ता",
      allocateResources: "संसाधन आवंटित करें",
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
        personnel: {
          title: "कर्मचारी प्रबंधन",
          addButton: "कर्मचारी जोड़ें",
          loading: "कर्मचारी डेटा लोड हो रहा है...",
        },
        messages: {
          title: "संदेश",
          newButton: "नया संदेश",
        },
        organization: {
          title: "संगठन प्रोफ़ाइल",
          button: "प्रोफ़ाइल संपादित करें",
          loading: "संगठन डेटा लोड हो रहा है...",
        },
        sos: {
          title: "एसओएस रिपोर्ट",
          header: "एसओएस रिपोर्ट",
          location: "स्थान",
          help: "मदद भेजें",
          coordinates: "निर्देशांक",
          time: "रिपोर्ट किया गया समय",
        },
      },
    },

    allocateResourceForm: {
      Allocate_Resource: "संसाधन आवंटित करें",
      Request_for: "अनुरोध करें",
      Allocate_Quantity: "आवंटित मात्रा",
      Available: "उपलब्ध",
      alert: "अमान्य आवंटन राशि।",
      Confirm_Allocation: "आवंटन की पुष्टि करें",
    },
    analytics: {
      title: "संसाधन विश्लेषण डैशबोर्ड",
      lastUpadte: "अंतिम अपडेट",
      loading: "उन्नत विश्लेषण किया जा रहा है...",
      Timeline: "24-घंटे की संसाधन पूर्वानुमान समयरेखा",
      noPredicitonTimeline: "कोई पूर्वानुमान समयरेखा उपलब्ध नहीं",
      prority: "स्थान प्राथमिकता स्कोर (रीयल-टाइम में अपडेटेड)",
      nullPrority: "कोई प्राथमिकता डेटा उपलब्ध नहीं",

      gapAnalysis: {
        title: "उन्नत संसाधन अंतर विश्लेषण",
        missingTypes: "अनुपलब्ध प्रकार",
        need: "आवश्यकता",
        null: "कोई संसाधन कमी नहीं",
      },

      immediate: {
        title: "तत्काल आवश्यकताएँ",
        null: "कोई तत्काल आवश्यकता नहीं",
      },

      surplous: {
        title: "अतिरिक्त संसाधन",
        extra: "अतिरिक्त",
        location: "स्थान",
        null: "कोई अतिरिक्त संसाधन नहीं",
      },

      emergingNeeds: {
        title: "उभरती आवश्यकताएँ",
        predicted: "पूर्वानुमानित",
        confidence: "विश्वसनीयता",
        null: "कोई उभरती आवश्यकताएँ पूर्वानुमानित नहीं",
      },

      depletion: {
        title: "उन्नत संसाधन समाप्ति पूर्वानुमान",
        Resource: "संसाधन",
        Name: "नाम",
        Current: "वर्तमान",
        Depletion_Time: "समाप्ति समय",
        Probability: "संभावना",
        Trend: "प्रवृत्ति",
        Velocity: "गति",
        Confidence: "विश्वसनीयता",
        null: "कोई समाप्ति पूर्वानुमान उपलब्ध नहीं",
      },

      history: {
        title: "संसाधन इतिहास का अवलोकन",
        total: "कुल इतिहास रिकॉर्ड",
        active: "सक्रिय संसाधन",
        pending: "लंबित अनुरोध",
      },
    },
  },
};
