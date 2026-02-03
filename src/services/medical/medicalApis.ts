import {handleServerError2, Paginated} from "../stationServices/utils";
import {toast} from "sonner";
import {PrisonerItem} from "../stationServices/visitorsServices/VisitorsService";
import { getPrisoners } from "../stationServices/visitorsServices/VisitorsService"
import {getBloodGroups, getMedicalRecords, MedicalRecord} from "./medical";
import React from "react";
import {Unit} from "../stationServices/visitorsServices/visitorItem";

// Get prisoners
export async function getPrisonersList(setData: React.Dispatch<React.SetStateAction<PrisonerItem[]>>){
    const response = await getPrisoners()
    populateList(response, "There are no prisoners available", setData)
}

function populateList(response: any, msg: string, setData: any) {
    if (handleServerError2(response)) return true

    if ("results" in response) {
      const data = response.results
        console.log(data)
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

export async function getBloodGroupList(setData: React.Dispatch<React.SetStateAction<Unit[]>>) {
    const response = await getBloodGroups()
    populateList(response, "There are no blood groups", setData)
}