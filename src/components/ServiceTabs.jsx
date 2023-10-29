import React, { useState } from "react";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { tokens } from "../theme";
import { useStore } from "../store/store";


function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}



export default function ServiceTabs() {
  const [activeTab, setActiveTab] = useState(0); // Initialize activeTab with the index of the first tab
  const { registry } = useStore();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Function to switch between tabs
  const changeTab = (event, newValue) => {
    setActiveTab(newValue);
  };

  const tabKeys = Object.keys(registry);

  return (
    <div>
      <Box
        sx={{
          "& .MuiButtonBase-root": {
            border: "none",
            borderBottom: "none",
            color: colors.greenAccent[300],
            backgroundColor: colors.blueAccent[700],
          },
        }}
      >
        <Paper square>
          <Tabs
            value={activeTab}
            indicatorColor="primary"
            textColor="primary"
            onChange={changeTab}
          >
            {tabKeys.map((key, index) => (
              <Tab label={key} key={index} />
            ))}
          </Tabs>
        </Paper>
        <div className="tab-panels">
          {tabKeys.map((key, index) => (
            <CustomTabPanel
              key={key}
              value={activeTab}
              index={index}
            >
              <Typography variant="body2" component="div">
                <pre>{JSON.stringify(registry[key], null, 2)}</pre>
              </Typography>
            </CustomTabPanel>
          ))}
        </div>
      </Box>
    </div>
  );
}
