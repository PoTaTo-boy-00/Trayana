export interface TranslationDictionary {
  [language: string]: TranslationLanguage;
}

interface TranslationLanguage {
  //! predcition
  disaster: {
    title: string;
    desc: string;
  };

  //!maps
  maps: {
    title: string;
    desc1: string;
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
    Resource_Requests: string;
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

  ui: {
    admin: {
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

  allocateResourceForm: {
    Allocate_Resource: string;
    Request_for: string;
    Allocate_Quantity: string;
    Available: string;
    alert: string;
    Confirm_Allocation: string;
  };
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
  resources: {
    title: string;
    filter: string;

    btnName: string;

    formTitle: string;
  };
  //requestResourceForm
  requestResourceForm: {
    title: string;
    name: string;
    quantity: string;
    unit: string;
    expiryDate: string;
    resourceType: {
      title: string;
      options: {
        food: string;
        medicine: string;
        shelter: string;
        equipment: string;
      };
    };
    status: {
      title: string;
      options: {
        requested: string;
        allocated: string;
        depleted: string;
      };
    };
    disasterType: {
      title: string;
      options: {
        flood: string;
        earthquake: string;
        fire: string;
        other: string;
      };
    };
    conditions: {
      title: string;
      placeholder: string;
    };
    urgency: {
      title: string;
      options: {
        low: string;
        medium: string;
        high: string;
      };
    };
    submitButton: string;
  };
  resourceForm: {
    title: string;
    name: string;
    type: {
      title: string;
      options: {
        food: string;
        medicine: string;
        shelter: string;
        equipment: string;
      };
    };
    quantity: string;
    unit: string;
    expiryDate: string;

    location: string;
    detect_location: string;
    locStatement: string;
    status: {
      title: string;
      options: {
        available: string;
        allocated: string;
        depleted: string;
      };
    };
    conditions: {
      title: string;
      placeholder: string;
    };
    submitButton: string;
  };

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

  partnerPage: {
    components: {
      dashboard: {
        title: string;
        description: string;
        resourceCount: string;
        personnelCount: string;
        organizationStatus: string;
        allSystemsOperational: string;
      };
      alerts: {
        title: string;
      };
      resources: {
        title: string;
        requestedResources: string;
        requestButton: string;
        addButton: string;
        //requestResourceForm
        requestResourceForm: {
          title: string;
          name: string;
          quantity: string;
          unit: string;
          expiryDate: string;
          resourceType: {
            title: string;
            options: {
              food: string;
              medicine: string;
              shelter: string;
              equipment: string;
            };
          };
          status: {
            title: string;
            options: {
              requested: string;
              allocated: string;
              depleted: string;
            };
          };
          disasterType: {
            title: string;
            options: {
              flood: string;
              earthquake: string;
              fire: string;
              other: string;
            };
          };
          conditions: {
            title: string;
            placeholder: string;
          };
          urgency: {
            title: string;
            options: {
              low: string;
              medium: string;
              high: string;
            };
          };
          submitButton: string;
        };
        addResourceForm: {
          title: string;
          name: string;
          type: {
            title: string;
            options: {
              food: string;
              medicine: string;
              shelter: string;
              equipment: string;
            };
          };
          quantity: string;
          unit: string;
          expiryDate: string;
          status: {
            title: string;
            options: {
              available: string;
              allocated: string;
              depleted: string;
            };
          };
          conditions: {
            title: string;
            placeholder: string;
          };
          submitButton: string;
        };
      };
      personnel: {
        title: string;
        addButton: string;
        loading: string;
      };
      messages: {
        title: string;
        newButton: string;
      };
      organization: {
        title: string;
        button: string;
        loading: string;
      };
      sos: {
        title: string;
        header: string;
        location: string;
        help: string;
        coordinates: string;
        time: string;
      };
    };
  };
}
