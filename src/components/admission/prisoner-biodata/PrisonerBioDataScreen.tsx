import React, { useState } from "react";
import PrisonerBioDataList from "./PrisonerBioDataList";
import PrisonerDetailScreen from "./PrisonerDetailScreen";

const PrisonerBioDataScreen: React.FC = () => {
  const [currentView, setCurrentView] = useState<"list" | "detail">("list");
  const [selectedPrisonerId, setSelectedPrisonerId] = useState<string | null>(null);

  const handleNavigate = (page: string, prisonerId?: string) => {
    if (page === "admissions-management-prisoner-biodata-detail" && prisonerId) {
      setSelectedPrisonerId(prisonerId);
      setCurrentView("detail");
    }
  };

  const handleBack = () => {
    setCurrentView("list");
    setSelectedPrisonerId(null);
  };

  if (currentView === "detail" && selectedPrisonerId) {
    return <PrisonerDetailScreen prisonerId={selectedPrisonerId} onBack={handleBack} />;
  }

  return <PrisonerBioDataList onNavigate={handleNavigate} />;
};

export default PrisonerBioDataScreen;
