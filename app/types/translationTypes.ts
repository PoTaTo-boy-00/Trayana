import { string } from "zod";

export interface TranslationDictionary {
  [language: string]: {
    //!ui
    ui: {
      admin:{
        title: string;
        components: {
          alerts: string;
          organizations: string;
          messages: string;
          maps: string;
          settings: string;
          dashboard: string;
          resources: string;
          analytics: string;
        };
      };

      partner: {
        title: string;
        components: {
          dashboard: string;
          alerts: string;
          resources: string;
          personnel: string;
          map: string;
          messages: string;
          organization: string;
          sos: string;
          settings: string;
        };
      };
    };

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
      // legend_title: string;
      cardTitle: string;
      Available_Resources: string;
      Requested_Resources: string;
      Map_Style: string;
      Roadmap: string;
      Satellite: string;
      Hybrid: string;
      Terrain: string;
      Enable_Clustering: string;
      Statistics: string;
      Organizations: string;
      // Available_Resources: string;
    };

    //!messages
    messages: {
      title: string;
      button: string;
      msgType: {
        broadcast: string;
        direct: string;
        group: string;
      };
    };
    //!message form
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
      };
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
      };
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
      delete: string;
      dialogTitle: string;
      Type: string;
      Capabilities: string;
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

    //!Resource

    resources: {
      title: string;
      filter: string;

      btnName: string;

      formTitle: string;
    };

    //!Resource Form

    resourceForm: {
      name: string;
      type: string;
      item: {
        food: string;
        medicine: string;
        shelter: string;
        equipment: string;
      };
      quantity: string;
      unit: string;
      location: string;
      detect_location: string;
      locStatement: string;
      expiryDate: string;
      conditions: string;
      cdt_placeholder: string;
      add_Resource: string;
    };

    //!Allocate Resource

    allocateResourceForm: {
      Allocate_Resource: string;
      Request_for: string;
      Allocate_Quantity: string;
      Available: string;
      alert: string;
      Confirm_Allocation: string;
      // Allocate Resources:string
    };

    //!Requuested Resource

    ResourcesCard: {
      type: string;
      quantity: string;
      location: string;
      status: string;
      conditions: string;
      expiryDate: string;
      requestedBy: string;
      allocateResources: string;
    };

    //! Analytics Dashboard
    analytics: {
      title: string;
      lastUpadte: string;
      loading: string;
      Timeline: string;
      noPredicitonTimeline: string;
      prority: string;
      nullPrority: string;
      gapAnalysis: {
        title: string;
        missingTypes: string;
        need: string;
        null: string;
      };
      immediate: {
        title: string;
        null: string;
      };
      surplous: {
        title: string;
        extra: string;
        location: string;
        null: string;
      };
      emergingNeeds: {
        title: string;
        predicted: string;
        confidence: string;
        null: string;
      };
      depletion: {
        title: string;
        Resource: string;
        Name: string;
        Current: string;
        Depletion_Time: string;
        Probability: string;
        Trend: string;
        Velocity: string;
        Confidence: string;
        null: string;
      };
      history: {
        title: string;
        total: string;
        active: string;
        pending: string;
      };
    };
  };
}
