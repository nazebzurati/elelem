import db from "@lib/database";
import useSettings from "@store/settings";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Step1, Step2, Step3, Step4 } from "./onboarding-steps";

export default function Onboard() {
  const settingsStore = useSettings();
  const navigation = useNavigate();
  useEffect(() => {
    db.assistant.count().then((count) => {
      if (count > 0 && settingsStore.isOnboardingCompleted) {
        navigation("/chat");
      }
    });
  }, []);

  const [step, setStep] = useState(1);
  return (
    <div className="h-svh p-8 space-y-10 flex flex-col justify-between">
      <ul className="steps w-full">
        <li className={`step${step >= 1 ? " step-primary" : ""}`} />
        <li className={`step${step >= 2 ? " step-primary" : ""}`} />
        <li className={`step${step >= 3 ? " step-primary" : ""}`} />
        <li className={`step${step >= 4 ? " step-primary" : ""}`} />
      </ul>
      <Steps index={step} setStep={setStep} />
    </div>
  );
}

function Steps({
  index,
  setStep,
}: Readonly<{
  index: number;
  setStep: React.Dispatch<React.SetStateAction<number>>;
}>) {
  if (index === 2) return <Step2 setStep={setStep} />;
  else if (index === 3) return <Step3 setStep={setStep} />;
  else if (index === 4) return <Step4 setStep={setStep} />;
  return <Step1 setStep={setStep} />;
}
