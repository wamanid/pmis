import {handleServerError2, Paginated} from "../../stationServices/utils";
import {toast} from "sonner";
import {PrisonerItem} from "../../stationServices/visitorsServices/VisitorsService";
import { getPrisoners } from "../../stationServices/visitorsServices/VisitorsService"
import {
    BmiClassification, BmiRecord, CaseBook,
    getBloodGroups,
    getBmiClassifications,
    getBmiRecords, getCaseBooks, getCheckupTypes,
    getMedicalRecords, getPresentationTypes,
    MedicalRecord
} from "./medical";
import React from "react";
import {Unit} from "../../stationServices/visitorsServices/visitorItem";

// Get prisoners
export async function getPrisonersList(setData: React.Dispatch<React.SetStateAction<PrisonerItem[]>>){
    const response = await getPrisoners()
    populateList(response, "There are no prisoners available", setData)
}

function populateList(response: any, msg: string, setData: any) {
    if (handleServerError2(response)) return true

    if ("results" in response) {
      const data = response.results
        // console.log(data)
      if (!data.length) {
        toast.error(msg)
        return true
      }
      setData(data)
    }
    return false
}

// Get medical records
export async function getMedicalRecordsList(setData: React.Dispatch<React.SetStateAction<MedicalRecord[]>>) {
    const response = await getMedicalRecords()
    populateList(response, "There are no medical records", setData)
}

// Get blood groups
export async function getBloodGroupList(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getBloodGroups()
    populateList(response, "There are no blood groups", setData)
}

// Get BMI classifications
export async function getClassifications(setData: React.Dispatch<React.SetStateAction<BmiClassification[]>>) {
    const response = await getBmiClassifications()
    populateList(response, "There are no BMI classifications", setData)
}

// Get BMI records
export async function getBmiList(setData: React.Dispatch<React.SetStateAction<BmiRecord[]>>) {
    const response = await getBmiRecords()
    populateList(response, "There are no BMI records", setData)
}

// Get case book list
export async function getCasebookList(setData: React.Dispatch<React.SetStateAction<CaseBook[]>>) {
    const response = await getCaseBooks()
    populateList(response, "There are no case records", setData)
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