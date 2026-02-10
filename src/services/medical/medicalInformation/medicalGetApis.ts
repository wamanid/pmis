import {handleServerError2, Paginated} from "../../stationServices/utils";
import {toast} from "sonner";
import {PrisonerItem} from "../../stationServices/visitorsServices/VisitorsService";
import { getPrisoners } from "../../stationServices/visitorsServices/VisitorsService"
import {
    BmiClassification, BmiRecord, CaseBook, Diagnosis, ExaminationResult,
    getBloodGroups,
    getBmiClassifications, getBmiRecord,
    getBmiRecords, getCaseBooks, getCheckupTypes, getDiagnosis, getDiseases, getExaminationResults, getExams,
    getMedicalRecords, getPresentationTypes, getRegiments, getSchedules,
    MedicalRecord, Schedule
} from "./medical";
import React from "react";
import {Unit} from "../../stationServices/visitorsServices/visitorItem";
import {flatten} from "react-hook-form/dist/utils/flatten";

// Get prisoners
export async function getPrisonersList(setData: React.Dispatch<React.SetStateAction<PrisonerItem[]>>): Promise<boolean>{
    const response = await getPrisoners()
    return populateList(response, "There are no prisoners available", setData)
}

function populateList(response: any, msg: string, setData: any): boolean {
    if (handleServerError2(response)) return false

    if ("results" in response) {
      const data = response.results
        console.log(data)
      if (!data.length) {
        toast.error(msg)
        return false
      }
      setData(data)
    }
    return true
}

// Get medical records
export async function getMedicalRecordsList(setData: React.Dispatch<React.SetStateAction<MedicalRecord[]>>) {
    const response = await getMedicalRecords()
    populateList(response, "There are no medical records", setData)
}

// Get blood groups
export async function getBloodGroupList(setData: React.Dispatch<React.SetStateAction<Unit[]>>): Promise<boolean> {
    const response = await getBloodGroups()
    return populateList(response, "There are no blood groups", setData)
}

// Get BMI classifications
export async function getClassifications(setData: React.Dispatch<React.SetStateAction<BmiClassification[]>>) {
    const response = await getBmiClassifications()
    populateList(response, "There are no BMI classifications", setData)
}

// Get BMI records
export async function getBmiList(setData: React.Dispatch<React.SetStateAction<BmiRecord[]>>): Promise<boolean> {
    const response = await getBmiRecords()
    return populateList(response, "There are no BMI records", setData)
}

export async function getBmi(setData: React.Dispatch<React.SetStateAction<BmiRecord[]>>, prisonerId: string): Promise<boolean> {
    const response = await getBmiRecord(prisonerId)
    return populateList(response, "There are no BMI records for this prisoner", setData)
}

// Get case book list
export async function getCasebookList(setData: React.Dispatch<React.SetStateAction<CaseBook[]>>): Promise<boolean> {
    const response = await getCaseBooks()
    return populateList(response, "There are no case records", setData)
}

// Get presentation types
export async function getPresentations(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getPresentationTypes()
    populateList(response, "There are no presentation types", setData)
}

// Get checkup types
export async function getCheckupTypesList(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getCheckupTypes()
    populateList(response, "There are no checkup types", setData)
}

// Get Schedule
export async function getScheduleList(setData: React.Dispatch<React.SetStateAction<Schedule[]>>) {
    const response = await getSchedules()
    populateList(response, "There are no schedules", setData)
}

// Get Exams
export async function getExamsList(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getExams()
    populateList(response, "There are no medical exams", setData)
}

// Get Examination Results
export async function getExaminationResultsList(setData: React.Dispatch<React.SetStateAction<ExaminationResult[]>>) {
    const response = await getExaminationResults()
    populateList(response, "There are no examination results", setData)
}

// Get Diagnosis
export async function getDiagnosisList(setData: React.Dispatch<React.SetStateAction<Diagnosis[]>>) {
    const response = await getDiagnosis()
    populateList(response, "There are no diagnosis records", setData)
}

// Get Regiment
export async function getRegimentList(setData: React.Dispatch<React.SetStateAction<Unit[]>>): Promise<boolean> {
    const response = await getRegiments()
    return populateList(response, "There are no regiment records", setData)
}

// Get Diseases
export async function getDiseasesList(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getDiseases()
    populateList(response, "There are no diseases records", setData)
}