import { useState } from "react";
import { Card, CardContent } from "../ui/card";
import PrisonerSearchScreenWider from "../common/PrisonerSearchScreen-wider";
import PunishmentBookList from "./PunishmentBookList";
import OffencesCommittedList from "./OffencesCommittedList";
import PunishmentsInstitutedList from "./PunishmentsInstitutedList";
import ForfeituresList from "./ForfeituresList";
import PrivilegeForfeituresList from "./PrivilegeForfeituresList";
import ProceedingsList from "./ProceedingsList";
import WitnessesList from "./WitnessesList";
import AppealsList from "./AppealsList";
import { AlertTriangle } from "lucide-react";

export default function ViewDisciplineDetail() {
  const [activeTab, setActiveTab] = useState("punishment-books");

  const tabs = [
    { id: "punishment-books", label: "Punishment Books" },
    { id: "offences-committed", label: "Offences Committed" },
    { id: "punishments-instituted", label: "Punishments Instituted" },
    { id: "forfeitures", label: "Forfeitures" },
    { id: "privilege-forfeitures", label: "Privilege Forfeitures" },
    { id: "proceedings", label: "Proceedings" },
    { id: "witnesses", label: "Witnesses" },
    { id: "appeals", label: "Appeals" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-2" style={{ color: '#650000' }}>
        <AlertTriangle className="h-6 w-6" />
        <h1 className="text-2xl">Discipline Information</h1>
      </div>

      {/* Prisoner Search Section */}
      <Card style={{ borderTop: '3px solid #650000' }}>
        <CardContent className="pt-6">
          <PrisonerSearchScreenWider showTitle={true} />
        </CardContent>
      </Card>

      {/* Discipline Information Tabs */}
      <Card>
        <CardContent className="p-0">
          {/* Custom Tabs Navigation */}
          <div className="flex gap-2 p-4 bg-gray-100 border-b flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-3 rounded-lg transition-all shadow-sm ${
                  activeTab === tab.id
                    ? 'text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
                style={{
                  backgroundColor: activeTab === tab.id ? '#650000' : undefined,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "punishment-books" && (
            <div>
              <PunishmentBookList />
            </div>
          )}
          
          {activeTab === "offences-committed" && (
            <div>
              <OffencesCommittedList />
            </div>
          )}
          
          {activeTab === "punishments-instituted" && (
            <div>
              <PunishmentsInstitutedList />
            </div>
          )}
          
          {activeTab === "forfeitures" && (
            <div>
              <ForfeituresList />
            </div>
          )}
          
          {activeTab === "privilege-forfeitures" && (
            <div>
              <PrivilegeForfeituresList />
            </div>
          )}
          
          {activeTab === "proceedings" && (
            <div>
              <ProceedingsList />
            </div>
          )}
          
          {activeTab === "witnesses" && (
            <div>
              <WitnessesList />
            </div>
          )}
          
          {activeTab === "appeals" && (
            <div>
              <AppealsList />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}