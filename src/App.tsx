import { CssBaseline, GlobalStyles } from "@mui/material";
import { Router } from "./routes/Router";
import { ProfileProvider } from "./contexts/ProfileContext";

function App() {
  return (
    <>
      <CssBaseline />
      <GlobalStyles
        styles={{
          html: { height: "100%", width: "100%" },
          body: { height: "100%", width: "100%", margin: 0, background: "#ffffff" },
          "#root": { height: "100%", width: "100%" },
        }}
      />
      <ProfileProvider>
        <Router />
      </ProfileProvider>
    </>
  );
}

export default App;
