import {handleServerError2} from "../../stationServices/utils";
import {toast} from "sonner";
import {
    getProgrammes,
    getStatuses,
    Programme,
    Enrollment,
    getEnrollments,
    getCertifications,
    Sponsor,
    getSponsors, ProgrammeStage, getProgrammeStages, Assessment, getAssessments, Session, getSessions
} from "./index";
import React from "react";
import {Unit} from "../../stationServices/visitorsServices/visitorItem";
import {getStaffProfile, StaffItem} from "../../stationServices/staffDeploymentService";

function populateList(response: any, msg: string, setData: any): boolean {
    if (handleServerError2(response)) return false

    if ("results" in response) {
      const data = response.results
        // console.log(data)
      if (!data.length) {
        toast.error(msg)
        return false
      }
      setData(data)
    }
    return true
}

// Get Programmes
export async function getProgrammesList(setData: React.Dispatch<React.SetStateAction<Programme[]>>) {
    const response = await getProgrammes()
    populateList(response, "There are no programmes", setData)
}

export async function getProgressStatusList(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getStatuses()
    populateList(response, "There are no progress statuses", setData)
}

export async function getCertificationList(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getCertifications()
    populateList(response, "There are no certifications", setData)
}

export async function getEnrollmentList(setData: React.Dispatch<React.SetStateAction<Enrollment[]>>) {
    const response = await getEnrollments()
    populateList(response, "There are no enrollments", setData)
}

export async function getSponsorList(setData: React.Dispatch<React.SetStateAction<Sponsor[]>>): Promise<boolean> {
    const response = await getSponsors()
    return populateList(response, "There are no sponsors", setData)
}

export async function getProgrammeStagesList(programme: string, setData: React.Dispatch<React.SetStateAction<ProgrammeStage[]>>): Promise<boolean> {
    const response = await getProgrammeStages(programme)
    return populateList(response, "There are no programme stages", setData)
}

export async function getStaffList(setData: React.Dispatch<React.SetStateAction<StaffItem[]>>): Promise<boolean> {
    const response = await getStaffProfile()
    return populateList(response, "There are no staff members", setData)
}

// Assessments

export async function getAssessmentList(setData: React.Dispatch<React.SetStateAction<Assessment[]>>) {
    const response = await getAssessments()
    populateList(response, "There are no assessments", setData)
}

// Sessions

export async function getSessionList(setData: React.Dispatch<React.SetStateAction<Session[]>>) {
    const response = await getSessions()
    populateList(response, "There are no enrollment sessions", setData)
}