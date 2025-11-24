import { initializeApp } from "firebase/app";
import { getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: "AIzaSyD0gv_2NnS1zPrRE2rgF85fx61pyVLFKUs",
  authDomain: "streamcart-login.firebaseapp.com",
  projectId: "streamcart-login",
  appId: "1:658712603017:web:c0e2fff239fee585659958"
};

const app = initializeApp(firebaseConfig);

export const functions = getFunctions(app);
export default app;
