import { createContext, useEffect, useState } from "react";

// Create a React context to share script loaded state if needed by other components
const CloudinaryScriptContext = createContext();

function UploadWidget({ uwConfig, setPublicId, setState }) {
  // Track whether the Cloudinary upload widget script has finished loading
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // If script is already loaded, no need to load again
    if (loaded) return;

    // Check if script tag for Cloudinary upload widget already exists in the DOM
    const existingScript = document.getElementById("cloudinary-upload-widget");

    if (!existingScript) {
      // If not, create the script tag to load Cloudinary's widget script
      const script = document.createElement("script");
      script.id = "cloudinary-upload-widget"; // Set an id so we can find it later
      script.src = "https://upload-widget.cloudinary.com/global/all.js"; // URL of Cloudinary's widget script
      script.async = true; // Load script asynchronously so it doesn't block page rendering

      // When the script finishes loading, update state to indicate it's ready
      script.onload = () => setLoaded(true);

      // Add the script tag to the document body to start loading
      document.body.appendChild(script);
    } else {
      // If script tag already exists, just mark it as loaded
      setLoaded(true);
    }
  }, [loaded]); // Run this effect whenever "loaded" state changes

  // This function runs when the Upload button is clicked
  const handleUploadClick = () => {
    // If script not loaded yet or cloudinary object doesn't exist, do nothing
    if (!loaded || !window.cloudinary) return;

    // Create a new Cloudinary upload widget with the config passed as props
    const widget = window.cloudinary.createUploadWidget(
      uwConfig, // Configuration object for widget (cloud name, upload preset, etc.)
      (error, result) => {
        // This callback runs during the upload process to report status
        if (!error && result && result.event === "success") {
          // Upload succeeded! Log the info
          console.log("Upload successful:", result.info);

          // Update the state with the new uploaded image URL
          setState((prev) => [...prev, result.info.secure_url]);

          // If a setPublicId function was passed, also update public_id (optional)
          if (setPublicId) setPublicId(result.info.public_id);
        }
      }
    );

    // Open the Cloudinary upload widget popup/modal so user can select files
    widget.open();
  };

  return (
    // Provide the loaded state via React context, in case other components need it
    <CloudinaryScriptContext.Provider value={{ loaded }}>
      {/* Button that triggers file upload */}
      <button onClick={handleUploadClick} className="cloudinary-button">
        Upload
      </button>
    </CloudinaryScriptContext.Provider>
  );
}

// Export component and context so they can be used elsewhere
export default UploadWidget;
export { CloudinaryScriptContext };
