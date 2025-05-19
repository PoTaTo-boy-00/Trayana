interface TranslationDictionary {
  [language: string]: {
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
  };
}
