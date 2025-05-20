
import React, { useState } from "react";
import SettingsMenu from "../features/Settings/SettingsMenu";
import DetectionSettings from "../features/Settings/DetectionSettings";
import Schedule from "../features/Settings/Schedule";
import Capture from "../features/Settings/Capture";
import AlarmSystem from "../features/Settings/AlarmSystem";
import Mail from "../features/Settings/Mail";
import UploadService from "../features/Settings/UploadService";
import About from "../features/Settings/About";

const styles = {
  app: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  content: {
    flex: 1,
    padding: "2rem",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
  },
};

const Settings = () => {
  const [selected, setSelected] = useState("");

  const renderContent = () => {
    switch (selected) {
      case "Detection Settings":
        return <DetectionSettings />;
      case "Schedule":
        return <Schedule />;
      case "Capture":
        return <Capture />;
      case "Alarm System":
        return <AlarmSystem />;
      case "Mail":
        return <Mail />;
      case "Upload Service":
        return <UploadService />;
      case "About":
        return <About />;
      default:
        return <h2 style={{ padding: "2rem" }}>Please select a setting.</h2>;
    }
  };

  return (
    <div style={styles.app}>
      <SettingsMenu onSelect={setSelected} />
      <div style={styles.content}>
        <div style={{ width: "100%", maxWidth: "800px" }}>{renderContent()}</div>
      </div>
    </div>
  );
};

export default Settings;
