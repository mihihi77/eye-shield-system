import React from "react";

function ContentDisplay({ selected }) {
  const contentMap = {
    detection: "This is the Detection Settings section.",
    schedule: "Here is the Schedule configuration.",
    capture: "You can manage Capture options here.",
    alarm: "This is the Alarm System setup.",
    mail: "Mail configuration goes here.",
    upload: "Configure the Upload Service.",
    about: "About the system and version info."
  };

  return (
    <div style={{ padding: "20px", marginLeft: "260px" }}>
      <h2>{selected ? contentMap[selected] : "Please select a setting."}</h2>
    </div>
  );
}

export default ContentDisplay;
