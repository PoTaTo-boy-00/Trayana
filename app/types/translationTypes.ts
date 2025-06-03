interface TranslationDictionary {
  [language: string]: {
    //!maps
    maps: {
      title: string;
      description: string;
      legends: {
        personnel: string;
        sosAlerts: string;
        organizations: string;
        resources: string;
      };
      cardTitle: string;
    };

    //!messages
    messages: {
      title: string;
      button: string
    };
    //message form
    messageForm: {
      title: string;
      type: {
        title: string;
        placeholder: string;
        options: {
          direct: string;
          group: string;
          broadcast: string;
          sms: string;
          ussd: string;
        };
      }
      recipientId: {
        title: string;
        placeholder: string;
      };
      priority: {
        title: string;
        placeholder: string;
        options: {
          normal: string;
          urgent: string;
          emergency: string;
        };
      }
      deliveryMethod: {
        title: string;
        placeholder: string;
        options: {
          internet: string;
          sms: string;
          ussd: string;
        };
      };
      content: {
        title: string;
        placeholder: string;
      };
      submitButton: string;
    };

    //!settings

    settings: {
      title: string;
      tabs: {
        account: string;
        language: string;
        security: string;
        accessibility: string;
        communications: string;
      };
      accountSettings: {
        title: string;
        description: string;
        emailLabel: string;
        saveButton: string;
        loading: string;
        userNotFound: string;
      };
      languageSettings: {
        title: string;
        description: string;
        languageLabel: string;
      };
      accessibilitySettings: {
        title: string;
        description: string;
        highContrastLabel: string;
        reduceMotionLabel: string;
        screenReaderLabel: string;
        saveButton: string;
      };
      communicationSettings: {
        title: string;
        description: string;
        newslettersLabel: string;
        productUpdatesLabel: string;
        feedbackRequestsLabel: string;
        saveButton: string;
      };
    };

    //!dashboard

    dashboard: {
      title: string;
      cards: {
        activeAlerts: string;
        activeOrganizations: string;
        organizationInfo: string;
        fieldPersonnel: string;
        personnelInfo: string;
        systemStatus: string;
        systemOperational: string;
        allSystemsNormal: string;
      };
      floodPrediction: string;
      resourceAnalysis: string;
      optimizedRecommendation: string;
    };

    //!AlertsBadge

    alertBadge: {
      red: {
        label: string;
      };
      orange: {
        label: string;
      };
      yellow: {
        label: string;
      };
      green: {
        label: string;
      };
    };

    //!alerts

    alert: {
      title: string;
      button: string;
      dialogTitle: string;
      smsEnabled: {
        title: string;

        yes: string;
        no: string;
      };
      ussdCode: string;
      mediaUrls: string;
      voiceTranscriptions: string;
    };

    //!alertForm
    alertForm: {
      label: string;
      severity: {
        placeholder: string;
        options: {
          red: string;
          orange: string;
          yellow: string;
          green: string;
        };
      };
      alertTitle: {
        title: string;
        placeholder: string;
      };

      alertDescription: {
        title: string;
        placeholder: string;
      };

      location: {
        title: string;
        placeholder: string;
      };

      population: {
        title: string;
        placeholder: string;
      };

      mediaUrls: {
        title: string;
        placeholder: string;
      };

      // voiceTransciptions:{
      //   title:string,
      //   placeholder:string
      // },

      enableSMS: {
        title: string;
        placeholder: string;
        yes: string;
        no: string;
      };

      ussdCode: {
        title: string;
        placeholder: string;
      };

      submitButton: string;
    };

    //!organizations
    organizations: {
      title: string;
      button: string;
      dialogTitle: string;
    };

    //!organizationForm
    organizationForm: {
      orgName: string;
      orgTypes: {
        title: string;
        placeholder: string;
        options: {
          healthcare: string;
          ngo: string;
          essentials: string;
          infrastructure: string;
          community: string;
          private: string;
          specialized: string;
        };
      };
      orgCapabilities: {
        title: string;
        placeholder: string;
      };
      contactEmail: {
        title: string;
        // placeholder:string;
      };
      contactPhone: {
        title: string;
        // placeholder:string;
      };
      address: {
        title: string;
        // placeholder:string;
      };
      longitude: string;
      latitude: string;
      submitButton: string;
    };
  };
}
